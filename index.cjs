const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActivityType, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, MessageFlags, InteractionType, TextDisplayBuilder, ContainerBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, SeparatorSpacingSize, MediaGalleryItemBuilder, MediaGalleryBuilder, Events, Partials, AttachmentBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
require('dotenv').config()
const token=process.env.TOKEN
const fs=require('fs')
const app=require('express')()

app.get('/', (req, res) => res.send('Bot actif'));
app.listen(port, () => console.log(`Serveur écoutant sur le port ${port}`));

const client=new Client({
    intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences
    ],
    presence: {
        status: 'online', // statut online (icone verte),
        activities: [{
            name: 'charger le nb de membres',
            type: ActivityType.Playing
        }],
    },
    partials: [
        Partials.GuildMember
    ]
});

const checkCounts=async(user={}, guild={})=>{
    if(user.bot)return
    const countNow=numCounts[guild.id];
    const gradesCounts={
        100: '1k <:G_Money:1412241029179899934>',
        250: '2,5k <:G_Money:1412241029179899934>',
        500: '5k <:G_Money:1412241029179899934>',
        1000: '10k <:G_Money:1412241029179899934>',
        2500: '25k <:G_Money:1412241029179899934>',
        5000: '2 Lucky Block Paladium <:PaladiumLuckyBlock:1412240966315671735>'
    }
    if(Object.keys(gradesCounts).indexOf(numCounts[guild.id])>-1){
        const text=new TextInputBuilder().setContent(`### Nouveau concours <a:itemTada:1412843664396517489><a:itemConfetti:1412843661170970858><a:itemTadaReverse:1412843666590007346> !\nRécompense : **${gradesCounts[numCounts[guild.id]]}** !\n<a:PepeClapping:1362528383895863512> Prochainement un système de concours automatique sera mis en place !\n-# <@1026178670953508934> host le gw pls <:PandaArgent:1362528201162752341>`)
        const container=new ContainerBuilder()
            .addTextInputComponents(text)
        const channel=await guild.channels.cache.get('1412148708115611719')
        const message=await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
        await message.pin();
    }
}

const dataCounts=fs.readFileSync('counts.json', 'utf8');
var counts=JSON.parse(dataCounts);
const dataNumCounts=fs.readFileSync('num-counts.json', 'utf8');
var numCounts=JSON.parse(dataNumCounts);
var lastUserWhoCount=fs.readFileSync('last-user-who-count.txt', 'utf8');
/*const dataTickets=fs.readFileSync('tickets.json', 'utf8');
var tickets=JSON.parse(dataTickets);
const dataCategories=fs.readFileSync('categories.json', 'utf8');
var categories=JSON.parse(dataCategories);
const dataRoles=fs.readFileSync('roles.json', 'utf8');
var roles=JSON.parse(dataRoles);
const dataQueue=fs.readFileSync('queue.json', 'utf8');
var queue=JSON.parse(dataQueue);*/

client.on(Events.MessageCreate, async message=>{
    if(message.channel.id==='1412093336054927432'){
        if(message.author.bot)return;
        counts[message.guild.id]=counts[message.guild.id]||{}
        numCounts[message.guild.id]=numCounts[message.guild.id]||0
        counts[message.guild.id][message.author.id]=counts[message.guild.id][message.author.id]||0
        let strEval
        const regex=/^[0123456789\(\)\*\/\+-\.]+/
        if(regex.test(message.content)){
            strEval=message.content.match(regex)[0]
        }
        if(strEval){
            const strNum=String(eval(strEval))
            console.log(strNum, numCounts[message.guild.id])
            if((numCounts[message.guild.id]+1)===Number(strNum)){
                if(lastUserWhoCount!==message.author.id){
                    lastUserWhoCount=message.author.id
                    fs.writeFileSync('last-user-who-count.txt', lastUserWhoCount, 'utf8');
                    numCounts[message.guild.id]++
                    counts[message.guild.id][message.author.id]++
                    const jsonStr2=JSON.stringify(counts, null, 4);
                    fs.writeFileSync('counts.json', jsonStr2, 'utf8');
                    const jsonStr3=JSON.stringify(numCounts, null, 4);
                    fs.writeFileSync('num-counts.json', jsonStr3, 'utf8');
                    await message.react('✅')
                    await checkCounts(message.author, message.guild)
                }else{
                    message.react('⛓️‍💥')
                    const text=new TextDisplayBuilder().setContent(`### <:Flop:1362528257395785990> Oups...\nTu as compté deux fois de suite mais il ne faut pas.\nBon bah on recommence à 1 alors...`)
                    const container=new ContainerBuilder()
                        .addTextDisplayComponents(text)
                    message.channel.send({
                        flags: MessageFlags.IsComponentsV2,
                        components: [container]
                    })
                    numCounts[message.guild.id]=false
                    const jsonStr=JSON.stringify(numCounts, null, 4);
                    fs.writeFileSync('num-counts.json', jsonStr, 'utf8');
                    fs.writeFileSync('last-user-who-count.txt', '', 'utf8');
                    lastUserWhoCount=''
                }
            }else{
                await message.react('⛓️‍💥')
                const text=new TextDisplayBuilder().setContent(`### <:Flop:1362528257395785990> Oups...\nTu as mis **${strNum}**${strNum===strEval?'':` (\`${strEval}\`)`}.\nBon bah on recommence à 1 alors...`)
                const container=new ContainerBuilder()
                    .addTextDisplayComponents(text)
                message.channel.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [container]
                })
                numCounts[message.guild.id]=false
                const jsonStr=JSON.stringify(numCounts, null, 4);
                fs.writeFileSync('num-counts.json', jsonStr, 'utf8');
                fs.writeFileSync('last-user-who-count.txt', '', 'utf8');
                lastUserWhoCount=''
            }
        }
    }
})

client.on(Events.GuildMemberAdd, async member=>{
    client.user.setPresence({
        activities: [{
            name: `${member.guild.memberCount} membres !`,
            type: ActivityType.Watching
        }],
        status: 'online'
    });
})

client.on(Events.GuildMemberRemove, async member=>{
    client.user.setPresence({
        activities: [{
            name: `${member.guild.memberCount} membres !`,
            type: ActivityType.Watching
        }],
        status: 'online'
    });
})

client.on(Events.ClientReady, async()=>{
    client.user.setPresence({
        activities: [{
            name: `${(await client.guilds.cache.get('1353433954929344552')).memberCount} membres !`,
            type: ActivityType.Watching
        }],
        status: 'online'
    });
})

client.login(token)
