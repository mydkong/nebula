const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActivityType, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, MessageFlags, InteractionType, TextDisplayBuilder, ContainerBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, SeparatorSpacingSize, MediaGalleryItemBuilder, MediaGalleryBuilder, Events, Partials, AttachmentBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { token }=require('./token.json')
const fs=require('fs')
const path=require('path')
const axios=require('axios')
const { createCanvas, loadImage, GlobalFonts, Canvas }=require('@napi-rs/canvas')
const app=require('express')()

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(443, () => console.log(`Listening on port 443`));

GlobalFonts.registerFromPath(path.join(__dirname, 'trickster.ttf'), 'trickster')

const creerTop=(objet,longueur)=>{
  var objetFinal={};
  for(var iteration=0;iteration<longueur;iteration++){
    var plusHautNum=0;
    var plusHautId;
    var objetBoucleFor={}
    for(var iteration3=0;iteration3<Object.values(objet).length;iteration3++){
      if(Object.keys(objetFinal).indexOf(Object.keys(objet)[iteration3])<0){
        objetBoucleFor[Object.keys(objet)[iteration3]]=Object.values(objet)[iteration3]
      }
    }
    for(var iteration2=0;iteration2<Object.keys(objet).length;iteration2++){
      if(Object.keys(objetBoucleFor).indexOf(Object.keys(objet)[iteration2])>-1){
        if(Object.values(objet)[iteration2]>=plusHautNum){
          plusHautNum=Object.values(objet)[iteration2];
          plusHautId=Object.keys(objet)[iteration2];
        }
      }
    }
    objetFinal[plusHautId]=[plusHautNum, iteration]
  }
  return objetFinal;
}

const formaterTop=top=>{
	var tableaudefin=[];
	for(var i=0;i<Object.keys(top).length;i++){
		for(var j=0;j<Object.keys(top).length;j++){
			if(Object.values(top)[j][1]===i){
				var objetquitientpas={}
				objetquitientpas[Object.keys(top)[j]]=Object.values(top)[j][0]
				tableaudefin.push(objetquitientpas)
			}
		}
	}
	return tableaudefin
}

const displayTop=(obj={},l=5,debut='',fin='')=>{
  const top=formaterTop(creerTop(obj,l));
  var strdefin='';
  for(var x=0;x<top.length;x++){
    strdefin+=`${x+1}. ${debut}`
    strdefin+=Object.keys(top[x])[0]
    strdefin+=fin;
    strdefin+=' : '
    strdefin+=`${Object.values(top[x])[0]}\n`
  }
  return strdefin;
}

const chercherClassementTop=(top,id)=>{
  for(var i=0;i<top.length;i++){
    if(Object.keys(top[i])[0]===id)return i;
  }
}

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

const commands = [
    new SlashCommandBuilder()
		.setName('rankreinitialiser')
		.setDescription('Réinitialise tous les niveaux de ce serveur')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Le niveau du membre sélectionné ou de celui ayant exécuté la commande')
		.addUserOption(option=>
			option.setName('utilisateur')
			      .setDescription('L\'utilisateur à regarder')),
    new SlashCommandBuilder()
        .setName('comptes-classement')
        .setDescription('Affiche le classement des meilleurs compteurs')
].map(command => command.toJSON());


const rest = new REST({ version: '10' }).setToken(token);
(async aid=>{
	try {
		await rest.put(	
			Routes.applicationCommands(aid),
			{
				body: commands
			}
		);
		console.log('Commandes enregistrées avec succès !');
	} catch (error) {
		console.error(error);
	}
})('1411295326228451348');

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
const dataXp=fs.readFileSync('xp.json', 'utf8');
var xp=JSON.parse(dataXp);
const dataLevel=fs.readFileSync('level.json', 'utf8');
var level=JSON.parse(dataLevel);

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

client.on(Events.InteractionCreate, async interaction=>{
    if(!interaction.isChatInputCommand())return;
    if(interaction.commandName==='rank'){
        xp[interaction.guild.id]=xp[interaction.guild.id]||{}
        level[interaction.guild.id]=level[interaction.guild.id]||{}
        await interaction.deferReply()
        const user=interaction.options.getUser('utilisateur')||interaction.user
        const text=new TextDisplayBuilder().setContent(`### Rang de [\`@${user.globalName||user.username}\`](https://discord.com/users/${user.id}) :`)
        let reponse
        try{
            reponse=await axios.get(user.avatarURL({ dynamic: false, size: 128 })||user.defaultAvatarURL, {
                responseType: 'arraybuffer'
            })
        }catch{
            reponse=await axios.get('https://ikikrepus-yt.github.io/unkown-image.png', {
                responseType: 'arraybuffer'
            })
        }
        const avatarbuffer=Buffer.from(reponse.data)
        const canvas=createCanvas(750, 260)
        const ctx=canvas.getContext('2d')
        ctx.fillStyle='#574071'
        ctx.fillRect(0,0,canvas.width,canvas.height)
        const avatar=await loadImage(avatarbuffer)
        //164px y try{164px x}
        ctx.drawImage(avatar, 36,36,128,128)
        ctx.strokeStyle='#ffffff'
        ctx.lineWidth=8
        ctx.beginPath()
        ctx.roundRect(36,36,128,128,10)
        ctx.stroke()
        ctx.beginPath()
        ctx.roundRect(214,122,500,40,22.5)
        ctx.stroke()
        ctx.fillStyle='#ffffff'
        ctx.beginPath()
        const prochainPalier=Math.round(5*(((level[interaction.guild.id]||{})[user.id]||0)**1.8)+100*((level[interaction.guild.id]||{})[user.id]||0)+150)
        ctx.roundRect(214,122,Math.round(((xp[interaction.guild.id][user.id]||0)/prochainPalier)*500),40,22.5)
        ctx.fill()
        ctx.fillStyle='#000000'
        ctx.font='30px trickster'
        ctx.textAlign='center'
        ctx.fillText(`${(((xp[interaction.guild.id][user.id]||0)/prochainPalier)*100).toFixed(2)}%`, 464,152)
        ctx.fillStyle='#ffffff'
        ctx.lineWidth=7
        ctx.beginPath()
        ctx.moveTo(164,142)
        ctx.lineTo(214,142)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(164,62)
        ctx.lineTo(214,62)
        ctx.stroke()
        ctx.font='40px trickster'
        ctx.textAlign='center'
        ctx.fillText(user.globalName||user.username,451,77)
        ctx.beginPath()
        ctx.roundRect(214,32,500,60,10)
        ctx.stroke()
        ctx.font='30px trickster'
        ctx.textAlign='left'
        ctx.fillText(`Niveau ${level[interaction.guild.id][user.id]||0}`, 36,224)
        ctx.textAlign='right'
        ctx.fillText(`${xp[interaction.guild.id][user.id]||0}xp`, 714,224)
        ctx.font='20px trickster'
        ctx.textAlign='center'
        ctx.fillText(`Plus que ${prochainPalier-(xp[interaction.guild.id][user.id]||0)}xp pour arriver au niveau ${(level[interaction.guild.id][user.id]||0)+1}`, 385,224)
        const buffer=canvas.toBuffer('image/png')
        const attachment=new AttachmentBuilder(buffer, {
            name: 'rank.png'
        })
        const mediaitem=new MediaGalleryItemBuilder().setURL('attachment://rank.png')
        const gallery=new MediaGalleryBuilder()
            .addItems(mediaitem)
        const container=new ContainerBuilder()
            .addTextDisplayComponents(text)
            .addMediaGalleryComponents(gallery)
        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            files: [attachment],
            components: [container]
        })
    }else if(interaction.commandName==='rankreinitialiser'){
        await interaction.deferReply()
        xp[interaction.guild.id]={}
        level[interaction.guild.id]={}
        await interaction.editReply({
            content: `Tous les niveaux et expériences ont été réinitialisés de 0 !`
        })
    }
})

client.on(Events.InteractionCreate, async interaction=>{
    if(!interaction.isButton())return;
    if(interaction.customId==='/rank'){
        xp[interaction.guild.id]=xp[interaction.guild.id]||{}
        level[interaction.guild.id]=level[interaction.guild.id]||{}
        await interaction.deferReply({
            ephemeral: true
        })
        const user=interaction.user
        const text=new TextDisplayBuilder().setContent(`### Votre rang :`)
        let reponse
        try{
            reponse=await axios.get(user.avatarURL({ dynamic: false, size: 128 })||user.defaultAvatarURL, {
                responseType: 'arraybuffer'
            })
        }catch{
            reponse=await axios.get('https://ikikrepus-yt.github.io/unkown-image.png', {
                responseType: 'arraybuffer'
            })
        }
        const avatarbuffer=Buffer.from(reponse.data)
        const canvas=createCanvas(750, 260)
        const ctx=canvas.getContext('2d')
        ctx.fillStyle='#574071'
        ctx.fillRect(0,0,canvas.width,canvas.height)
        const avatar=await loadImage(avatarbuffer)
        //164px y try{164px x}
        ctx.drawImage(avatar, 36,36,128,128)
        ctx.strokeStyle='#ffffff'
        ctx.lineWidth=8
        ctx.beginPath()
        ctx.roundRect(36,36,128,128,10)
        ctx.stroke()
        ctx.beginPath()
        ctx.roundRect(214,122,500,40,22.5)
        ctx.stroke()
        ctx.fillStyle='#ffffff'
        ctx.beginPath()
        const prochainPalier=Math.round(5*(((level[interaction.guild.id]||{})[user.id]||0)**1.8)+100*((level[interaction.guild.id]||{})[user.id]||0)+150)
        ctx.roundRect(214,122,Math.round(((xp[interaction.guild.id][user.id]||0)/prochainPalier)*500),40,22.5)
        ctx.fill()
        ctx.fillStyle='#000000'
        ctx.font='30px trickster'
        ctx.textAlign='center'
        ctx.fillText(`${(((xp[interaction.guild.id][user.id]||0)/prochainPalier)*100).toFixed(2)}%`, 464,152)
        ctx.fillStyle='#ffffff'
        ctx.lineWidth=7
        ctx.beginPath()
        ctx.moveTo(164,142)
        ctx.lineTo(214,142)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(164,62)
        ctx.lineTo(214,62)
        ctx.stroke()
        ctx.font='40px trickster'
        ctx.textAlign='center'
        ctx.fillText(user.globalName||user.username,451,77)
        ctx.beginPath()
        ctx.roundRect(214,32,500,60,10)
        ctx.stroke()
        ctx.font='30px trickster'
        ctx.textAlign='left'
        ctx.fillText(`Niveau ${level[interaction.guild.id][user.id]||0}`, 36,224)
        ctx.textAlign='right'
        ctx.fillText(`${xp[interaction.guild.id][user.id]||0}xp`, 714,224)
        ctx.font='20px trickster'
        ctx.textAlign='center'
        ctx.fillText(`Plus que ${prochainPalier-(xp[interaction.guild.id][user.id]||0)}xp pour arriver au niveau ${(level[interaction.guild.id][user.id]||0)+1}`, 385,224)
        const buffer=canvas.toBuffer('image/png')
        const attachment=new AttachmentBuilder(buffer, {
            name: 'rank.png'
        })
        const mediaitem=new MediaGalleryItemBuilder().setURL('attachment://rank.png')
        const gallery=new MediaGalleryBuilder()
            .addItems(mediaitem)
        const container=new ContainerBuilder()
            .addTextDisplayComponents(text)
            .addMediaGalleryComponents(gallery)
        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            files: [attachment],
            components: [container]
        })
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

client.on(Events.MessageCreate, async message=>{
    if(message.author.bot)return;
    const prochainPalier=Math.round(5*(((level[message.guild.id]||{})[message.author.id]||0)**1.8)+100*((level[message.guild.id]||{})[message.author.id]||0)+150)
    const newxp=Math.round(20+(message.content.length/8))
    xp[message.guild.id]=xp[message.guild.id]||{}
    xp[message.guild.id][message.author.id]=((xp[message.guild.id]||{})[message.author.id]||0)+newxp
    if(prochainPalier<=xp[message.guild.id][message.author.id]){
        level[message.guild.id]=level[message.guild.id]||{}
        level[message.guild.id][message.author.id]=((level[message.guild.id]||0)[message.author.id]||0)+1
        xp[message.guild.id][message.author.id]=xp[message.guild.id][message.author.id]-prochainPalier
        const text=new TextDisplayBuilder().setContent(`### Rank up <:PandaArgent:1362528201162752341>\n<@${message.author.id}> a passé le **niveau ${level[message.guild.id][message.author.id]}** <:G_Money:1412241029179899934><:G_Money:1412241029179899934><:G_Money:1412241029179899934> !\nVous pouvez lui dire un grand GG à lui !`)
        const thumbnail=new ThumbnailBuilder().setURL(message.author.avatarURL({ dynamic: true, size: 256 })||message.author.defaultAvatarURL)
        const section=new SectionBuilder()
            .setThumbnailAccessory(thumbnail)
            .addTextDisplayComponents(text)
        const button=new ButtonBuilder()
            .setCustomId('/rank')
            .setLabel('Voir mon rang')
            .setStyle(ButtonStyle.Primary)
        const actionrow=new ActionRowBuilder().addComponents(button)
        const container=new ContainerBuilder()
            .addSectionComponents(section)
            .addActionRowComponents(actionrow)
        const channel=await message.guild.channels.cache.get('1353487171763310723')
        await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
    }
    const jsonStr1=JSON.stringify(xp, null, 4);
    fs.writeFileSync('xp.json', jsonStr1, 'utf8');
    xp=JSON.parse(jsonStr1);
    const jsonStr2=JSON.stringify(level, null, 4);
    fs.writeFileSync('level.json', jsonStr2, 'utf8');
    level=JSON.parse(jsonStr2);
})

client.on(Events.InteractionCreate, async interaction=>{
    if(!interaction.isChatInputCommand())return;
    if(interaction.commandName==='comptes-classement'){
		await interaction.deferReply();
		const copieMembre=JSON.parse(JSON.stringify(counts))
		let top=displayTop(copieMembre[interaction.guild.id],Object.keys(copieMembre[interaction.guild.id])?.length||0<10?Object.keys(copieMembre[interaction.guild.id])?.length||0:10,'$@$@$','@$@$@');
		for(const match of top.match(/\$@\$@\$(\d+)@\$@\$@/g)){
			console.log(new RegExp(match, ''))
		  const id=match.match(/\$@\$@\$(\d+)@\$@\$@/)[1]
		  const userFetched=await interaction.guild.members.cache.get(id);
		  top=top.replace(new RegExp(match.replaceAll("$", "\\$"), ''), `[\`@${userFetched.user.globalName||userFetched.user.username}\`](https://discord.com/users/${userFetched.user.id})`)
		}
		const place=chercherClassementTop(formaterTop(creerTop(copieMembre[interaction.guild.id],Object.keys(copieMembre[interaction.guild.id])?.length||0)),interaction.user.id)||'???';
		const text=new TextDisplayBuilder().setContent(`### Classement des 10 meilleurs compteurs sur ce serveur <:PandaArgent:1362528201162752341>\n${top}-# Vous êtes situé **${place+1}${place===2?'er':'ème'}**.`);
		const container=new ContainerBuilder()
		container.addTextDisplayComponents(text);
		interaction.editReply({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
    }
})

client.on(Events.GuildMemberAdd, async interaction=>{
	if(interaction.user.bot)return;
	const targetGuild=await client.guilds.cache.get(interaction.guild.id);
	const targetChannel=await targetGuild.channels.cache.get('1353433954929344552');
	const text=new TextDisplayBuilder().setContent(`### Ho ! Un nouveau membre !\n🎉 Hello \`@${interaction.user.globalName||interaction.user.username}\` <:hey:1233690175251415080> ! J'espère que tu vas bien t'amuser au sein de ce serveur 🎉 !\nCommence par lire le règlement de ce serveur <:ok:1233685313558282321>`);
	const buttonDiscuter=new ButtonBuilder()
		.setLabel('Lire le règlement')
		.setStyle(ButtonStyle.Link)
		.setURL('https://discord.com/channels/1075714463023505468/1087341354507583571/1101096244354498580');
	const targetUserAvatar=interaction.user.avatarURL({ dynamic: true, size: 256 })||member.user.defaultAvatarURL;
	const thumbnail=new ThumbnailBuilder().setURL(targetUserAvatar);
	const section=new SectionBuilder()
		.addTextDisplayComponents(text)
		.setThumbnailAccessory(thumbnail);
	const container=new ContainerBuilder();
	container.addSectionComponents(section);
	const actionrow=new ActionRowBuilder().addComponents(buttonDiscuter);
	container.addActionRowComponents(actionrow);
	try{
		await targetChannel.send({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
		const rulesChannel=await targetGuild.channels.cache.get('1087341354507583571');
		const ghostping=await rulesChannel.send(`<@${interaction.user.id}>`);
		await ghostping.delete();
	}catch{}
})

client.on(Events.GuildMemberRemove, async interaction=>{
	if(interaction.user.bot)return;
	if(interaction.partial){
		await interaction.fetch()
	}
	const targetGuild=await client.guilds.cache.get(interaction.guild.id);
	const targetChannel=await targetGuild.channels.cache.get('1143097458897997894');
	const text=new TextDisplayBuilder();
	text.setContent(`### Un membre vient de partir... <:noooo:1104388038047567943>\nÀ bientôt \`@${interaction.user.globalName||interaction.user.username}\` ! J'espère que tu t'es bien amusé(e) au sein de ce serveur :wave: !`);
	const targetUserAvatar=interaction.user.avatarURL({ dynamic: true, size: 256 })||interaction.user.defaultAvatarURL;
	const thumbnail=new ThumbnailBuilder().setURL(targetUserAvatar);
	const section=new SectionBuilder()
	section.setThumbnailAccessory(thumbnail)
	section.addTextDisplayComponents(text);
	const container=new ContainerBuilder()
	container.addSectionComponents(section);
	try{
		await targetChannel.send({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
	}catch{}
})/*

client.on(Events.ClientReady, async()=>{
    const text1=new TextDisplayBuilder().setContent("**# __REGLEMENT__ <:nebula:1354193392455647442>**\n**Merci de le lire intégralement afin de mieux l'appliquer**\n\n**# Article 1**\n**Respect et politesse envers les joueurs, et membres du staff.**\n\n**Sanction : Mute discord ou un bannissement**\n\n**# Article 2**\n**Les publicités sont interdites ainsi qu'en mp.**\n\n**Sanction : Mute discord ou un bannissement**\n\n**# Article 3**\n**Il est interdit de parler de sujet sensible ou illégaux (pornographie, religion, pédophilie, politique ...).**\n\n**Sanction : Mute discord ou un bannissement**\n\n**# Article 4**\n**Il est interdit de porter un pseudo insultant, offensant , non approprié ou promouvant un autre serveur.**\n\n**Sanction : Mute discord ou un bannissement**\n\n**# Article 5**\n**Pas de spam / de troll / et de ghostping.**\n\n**Sanction : Mute discord ou un bannissement**\n\n**# Article 6**\n**Les trolls, les soundboxs, les screamers, les modificateurs de voix, et le spam de changement de salon est interdit dans les salons vocaux.**\n\n**Sanction : Mute discord ou un bannissement**\n\n**# Article 7**\n**Les bots musique, et les commandes doivent être utilisé dans les channels qui leurs sont dédiés, il en va de même pour les discussions textuels.**\n\n**Sanction : Mute discord ou un bannissement**\n\n**# Article 8**\n**Il est interdit de prendre le pseudo d'un autre membre du discord, et de se faire passer pour lui.**\n\n**Sanction : Mute discord ou un bannissement**\n\n**# Article 9**\n**Ping un membre du staff sans raison.**\n\n**Sanction : Mute discord ou un bannissement**\n\n**# Article 10**\n**Il est interdit d'écrire en gros (#) sur le discord pour quiconque message  !**\n\n**Sanction : Mute discord ou un bannissement**\n\n**# Article 11**\n**Rester en sécurité. :**\n\n**Ne pas cliquer sur des liens d'inconnus.**\n**Ne pas communiquer d'information personnelle.**\n**Ne pas télécharger de logiciels de triche.**")
    const text2=new TextDisplayBuilder().setContent('**Veuillez cliquer sur ✅ pour accepter le règlement**')
    const separator=new SeparatorBuilder()
		.setSpacing(SeparatorSpacingSize.Small)
		.setDivider(true);
	const buttonTos=new ButtonBuilder()
		.setLabel('Discord ToS')
		.setStyle(ButtonStyle.Link)
		.setURL('https://discord.com/terms');
	const buttonGuidelines=new ButtonBuilder()
		.setLabel('Discord Guidelines')
		.setStyle(ButtonStyle.Link)
		.setURL('https://discord.com/guidelines');
	const actionrow=new ActionRowBuilder()
		.addComponents(buttonTos, buttonGuidelines);
	const container=new ContainerBuilder()
        .addTextDisplayComponents(text1)
        .addSeparatorComponents(separator)
        .addTextDisplayComponents(text2)
        .addActionRowComponents(actionrow);
    const guild=await client.guilds.cache.get('1353433954929344552');
    const channel=await guild.channels.cache.get('1087341354507583571');
    const message=await channel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
    })
})*/

client.login(token)
