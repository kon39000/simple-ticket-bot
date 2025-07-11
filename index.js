require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPPORT_ROLE_ID = process.env.SUPPORT_ROLE_ID;
const TICKET_CHANNEL_ID = process.env.TICKET_CHANNEL_ID;

// デバッグ用ログ
console.log('環境変数チェック:');
console.log('BOT_TOKEN exists:', !!BOT_TOKEN);
console.log('BOT_TOKEN length:', BOT_TOKEN ? BOT_TOKEN.length : 0);
console.log('SUPPORT_ROLE_ID:', SUPPORT_ROLE_ID);
console.log('TICKET_CHANNEL_ID:', TICKET_CHANNEL_ID);

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} としてログインしました！`);
    
    try {
        const channel = await client.channels.fetch(TICKET_CHANNEL_ID);
        
        // 既存のメッセージをチェック
        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessage = messages.find(msg => 
            msg.author.id === client.user.id && 
            msg.embeds.length > 0 &&
            msg.embeds[0].title === '🎫 サポートチケット'
        );
        
        if (!botMessage) {
            // チケット作成ボタンを含むメッセージを送信
            const embed = new EmbedBuilder()
                .setTitle('🎫 サポートチケット')
                .setDescription('プライベートなお問い合わせをしたい場合は、下のボタンをクリックしてチケットを作成してください。')
                .setColor(0x5865F2)
                .setFooter({ text: 'あなたとサポートスタッフのみが見ることができるスレッドが作成されます。' });
            
            const button = new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('チケットを作成')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary);
            
            const row = new ActionRowBuilder().addComponents(button);
            
            await channel.send({ embeds: [embed], components: [row] });
            console.log('✅ チケット作成ボタンを設置しました！');
        } else {
            console.log('✅ チケット作成ボタンは既に設置されています。');
        }
    } catch (error) {
        console.error('❌ チケット作成ボタンの設置に失敗しました:', error);
    }
});

client.on('interactionCreate', async interaction => {
    console.log('インタラクションを受信:', interaction.customId, interaction.user.tag);
    
    if (!interaction.isButton()) return;
    
    if (interaction.customId === 'create_ticket') {
        console.log('チケット作成開始:', interaction.user.tag);
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const guild = interaction.guild;
            const member = interaction.member;
            const channel = interaction.channel;
            
            // Botの権限をチェック
            const botMember = guild.members.me;
            if (!botMember.permissions.has([PermissionFlagsBits.CreatePrivateThreads, PermissionFlagsBits.ManageThreads])) {
                return await interaction.editReply({
                    content: '❌ Botにスレッド作成権限がありません。管理者に確認してください。',
                    ephemeral: true
                });
            }
            
            // スレッド名を生成（ticket-ユーザー名-タイムスタンプ）
            const timestamp = new Date().getTime();
            const threadName = `ticket-${member.user.username}-${timestamp}`;
            
            // プライベートスレッドを作成
            const thread = await channel.threads.create({
                name: threadName,
                autoArchiveDuration: 1440, // 24時間後に自動アーカイブ
                type: ChannelType.PrivateThread, // プライベートスレッドに変更
                reason: `${member.user.tag} のサポートチケット`
            });
            
            // スレッドにユーザーを追加
            await thread.members.add(member.id);
            
            // サポートロールを持つメンバーをスレッドに追加
            const supportRole = await guild.roles.fetch(SUPPORT_ROLE_ID);
            if (supportRole) {
                const supportMembers = supportRole.members;
                for (const [memberId, supportMember] of supportMembers) {
                    try {
                        await thread.members.add(memberId);
                    } catch (error) {
                        console.error(`サポートメンバー ${supportMember.user.tag} の追加に失敗:`, error);
                    }
                }
            }
            
            // スレッドの権限を設定（作成者とサポートロールのみアクセス可能）
            await thread.edit({
                locked: false,
                archived: false
            });
            
            // スレッド内に初回メッセージを送信
            const welcomeEmbed = new EmbedBuilder()
                .setTitle('🎫 チケットが作成されました')
                .setDescription(`${member} さん、お問い合わせありがとうございます。\n\nサポートスタッフが間もなく対応いたします。\nこのスレッドはあなたとサポートスタッフのみが閲覧できます。`)
                .setColor(0x00FF00)
                .addFields(
                    { name: 'チケットID', value: threadName, inline: true },
                    { name: '作成者', value: member.toString(), inline: true }
                )
                .setTimestamp();
            
            const closeButton = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('チケットを閉じる')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger);
            
            const row = new ActionRowBuilder().addComponents(closeButton);
            
            await thread.send({ content: `${member} <@&${SUPPORT_ROLE_ID}>`, embeds: [welcomeEmbed], components: [row] });
            
            // ユーザーに確認メッセージを送信
            await interaction.editReply({
                content: `✅ チケットが作成されました！\n${thread} でお問い合わせ内容をお伝えください。`,
                ephemeral: true
            });
            
        } catch (error) {
            console.error('チケット作成エラー:', error);
            console.error('エラーの詳細:', error.stack);
            await interaction.editReply({
                content: `❌ チケットの作成に失敗しました。エラー: ${error.message}`,
                ephemeral: true
            });
        }
    }
    
    if (interaction.customId === 'close_ticket') {
        // スレッド内でのみ動作
        if (!interaction.channel.isThread()) return;
        
        await interaction.deferReply();
        
        try {
            const thread = interaction.channel;
            
            // 確認メッセージ
            const confirmEmbed = new EmbedBuilder()
                .setTitle('🔒 チケットをクローズしました')
                .setDescription('このチケットは閉じられました。必要に応じて新しいチケットを作成してください。')
                .setColor(0xFF0000)
                .setTimestamp();
            
            await interaction.editReply({ embeds: [confirmEmbed] });
            
            // 少し待ってからスレッドをアーカイブ
            setTimeout(async () => {
                await thread.setArchived(true);
            }, 5000);
            
        } catch (error) {
            console.error('チケットクローズエラー:', error);
            await interaction.editReply({
                content: '❌ チケットのクローズに失敗しました。',
            });
        }
    }
});

// エラーハンドリング
client.on('error', console.error);

// Botを起動
client.login(BOT_TOKEN);