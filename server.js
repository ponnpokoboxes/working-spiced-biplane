const http = require("http");
const querystring = require("querystring");
const fs = require("node:fs");
const path = require("node:path");
const fetch = require("node-fetch");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  ChannelType,
  EmbedBuilder,
  AttachmentBuilder,
  WebhookClient,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.Reaction, Partials.Message],
});
client.commands = new Collection();
const {
  joinVoiceChannel,
  createAudioPlayer,
  NoSubscriberBehavior,
  EndBehaviorType,
  createAudioResource,
  VoiceConnectionStatus,
  StreamType,
  AudioPlayerStatus,
  demuxProbe,
  getVoiceConnection,
} = require("@discordjs/voice");
const { OpusEncoder } = require("@discordjs/opus");
const { PassThrough } = require("stream");
const { createReadStream } = require("node:fs");
const { Buffer } = require("node:buffer");
const { Blob } = require("buffer");
const { Readable } = require("stream");

http
  .createServer(function (req, res) {
    if (req.method == "POST") {
      var data = "";
      req.on("data", function (chunk) {
        data += chunk;
      });
      req.on("end", function () {
        if (!data) {
          console.log("No post data");
          res.end();
          return;
        }
        var dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }
        if (dataObject.type == "reaction") {
          console.log("reaction");
          let reactChId = dataObject.reactChId,
            reactMesId = dataObject.reactMesId,
            reactGuildId = dataObject.reactGuildId,
            roleId = dataObject.roleId,
            roleId2 = dataObject.roleId2,
            enterStamp = dataObject.enterStamp,
            exitStamp = dataObject.exitStamp,
            recChId = dataObject.recChId;
          count(
            reactChId,
            reactMesId,
            reactGuildId,
            roleId,
            roleId2,
            enterStamp,
            exitStamp,
            recChId
          );
          res.end();
          return;
        }
        if (dataObject.type == "agendaMng") {
          console.log("agendaMng");
          var agdURL = dataObject.agdURL,
            agdTXT = dataObject.agdTXT,
            agdCGL = dataObject.agdCGL,
            agdNUM = dataObject.agdNUM;
          var response = sinngiSt(agdURL, agdTXT, agdCGL, agdNUM).then(
            (response) => {
              console.log(response);
            }
          );
          res.end();
          return;
        }
        if (dataObject.type == "finish") {
          console.log("ponnpoko:" + dataObject.type);
          let userId = String(dataObject.userID);
          sendDm(userId, dataObject.comment);
          res.end();
          return;
        }
        if (dataObject.type == "finish2") {
          console.log("darumasann:" + dataObject.type);
          let channelId = String(dataObject.userID);
          if (dataObject.options != null) {
            let options = JSON.parse(dataObject.options);
            if (options.ext == "ext") {
              sendMsgWithFrags(channelId, dataObject.comment, options);
            } else {
              sendMsg(channelId, dataObject.comment);
            }
          } else {
            sendMsg(channelId, dataObject.comment);
          }
          res.end();
          return;
        }
        if (dataObject.type == "finish3") {
          console.log("darumasann:" + dataObject.type);
          let channelId = dataObject.userID,
            fieldTitle = dataObject.fieldTitle,
            text = dataObject.comment;
          if (dataObject.imageUrl === "null") {
            dataObject.imageUrl = null;
          }
          let image = dataObject.imageUrl,
            color = dataObject.embColor;
          sendEmbedMsg(channelId, fieldTitle, text, image, color); //channelId, fieldTitle, text, image, color
          res.end();
          return;
        }
        if (dataObject.type == "kotaeMng") {
          console.log("kotaeMng");
          var channelID = dataObject.channelID;
          var quizID = dataObject.quizID;
          quizReq(channelID, quizID);
          res.end();
          return;
        }
        if (dataObject.type == "countMng") {
          console.log("countMng");
          var channelID = dataObject.channelID,
            comment = dataObject.comment;
          /*var fromMesID = dataObject.fromMesID;*/
          darumaCounter(channelID, comment);
          res.end();
          return;
        }
        if (dataObject.type == "voiceOn") {
          console.log("voiceOn");
          var guildId = dataObject.guildId,
            vcId = dataObject.vcId,
            options = dataObject.options;
          /*var fromMesID = dataObject.fromMesID;*/
          voiceOn(guildId, vcId, options);
          res.end();
          return;
        }
        if (dataObject.type == "webhook1") {
          console.log("webhook1");
          webhook1(dataObject);
          res.end();
          return;
        }
        if (dataObject.type == "pdfToPng") {
          console.log("pdfToPng");
          pdfToPngController(dataObject.channelID);
          res.end();
          return;
        }
        if (dataObject.type == "searchPart") {
          console.log("searchPart");
          searchPart_controller(dataObject);
          res.end();
          return;
        }
        if (dataObject.type == "meiboAudit") {
          console.log("meiboAudit");
          meiboAudit_master(dataObject);
          res.end();
          return;
        }
        if (dataObject.type == "userCheck") {
          console.log("ponnpoko:" + dataObject.type);
          var whoIsHere = peopleInTheGuild(
            dataObject.guildID,
            dataObject.userID
          );
          var words = whoIsHere;
          res.end("うにょん" + words);
          return;
        }
        if (dataObject.type == "userCheck2") {
          console.log("ponnpoko:" + dataObject.type);
          var whoIsHere = peopleInTheGuild2(
            dataObject.guildID,
            dataObject.userID
          );
          var words = whoIsHere;
          res.end("うにょん" + words);
          return;
        }
        res.end();
      });
    } else if (req.method == "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(readyIs);
    }
  })
  .listen(process.env.PORT);

let readyIs = "NA";

client.once(Events.ClientReady, (c) => {
  console.log("Bot準備完了～");
  readyIs = "Discord Bot is active now\n";
  client.user.setPresence({ activities: [{ name: "サーバー補佐" }] });
});

client.on("debug", (c) => {
  console.log("▼▼debugによる情報▼▼\n" + c);
});

client.on("warn", (c) => {
  console.log("▼▼warnによる情報▼▼\n" + c);
});

client.on("ratelimit", (c) => {
  console.log(c);
});

if (process.env.OPERAS == undefined) {
  console.log("OPERASが設定されていません。");
  process.exit(0);
}

client.login(process.env.OPERAS);

async function count(
  reactChId,
  reactMesId,
  reactGuildId,
  roleId,
  roleId2,
  enterStamp,
  exitStamp,
  recChId
) {
  const enterStampS = String(enterStamp).replace(/<:/, "").replace(/:.*/, ""),
    exitStampS = String(exitStamp).replace(/<:/, "").replace(/:.*/, "");
  const messageReacted = await client.channels.cache
    .get(String(reactChId)) //試験用：1168351647337029782　実用：1175754185271169044
    .messages.fetch(String(reactMesId)); //試験用：1175112607670218822　実用：1175780865188581487
  let type = [];

  messageReacted.reactions.cache.forEach(async (reaction) => {
    const emojiName = reaction._emoji.name;
    const emojiCount = reaction.count;
    const reactionUsers = Array.from(await reaction.users.fetch());
    /*console.log(emojiName, reactionUsers);*/

    const guild = await client.guilds.cache.get(String(reactGuildId)); //試験用：1168349939525505054　実用：1071288663884959854
    const members = await guild.members.fetch();
    const roleT = await guild.roles.cache.get(String(roleId)); //試験用：1175113333851050014　実用：1071290225499840512
    let role2T;
    if (roleId2 != "") {
      role2T = await guild.roles.cache.get(String(roleId2));
    } //リクエスト内が空欄なら使わない

    console.log("reactionUsers.length: ", reactionUsers.length);
    /*console.log(role);*/
    console.log("emoji: ", emojiName, "role: ", typeof roleT);
    /*for(let round = 0; round < 2; round++){
    console.log("round", round);
    let rabel = "新規？: ",stampS = enterStampS, remS = exitStampS;
    if(round == 1){rabel = "抹消？: ", stampS = exitStampS, remS = enterStampS;}*/
    var cV = 0;
    while (cV < reactionUsers.length) {
      try {
        if (
          //"✅"
          emojiName === String(enterStampS) &&
          String(reactionUsers[cV][0]) !== "835710830417805383"
        ) {
          //はわのふ以外
          console.log("新規？: ", String(reactionUsers[cV][0]));
          var member = await guild.members.cache.get(reactionUsers[cV][0]);
          /*console.log(member);*/
          if (await member.roles.cache.has(String(roleId))) {
            var cnew = "";
          } else {
            var cnew = " 🆕"; //" 🆕"
            await reactRemove(
              messageReacted,
              reactionUsers[cV][0],
              String(exitStampS),
              "0"
            ); //以前のリアクションは解除。message, userId, emojiId
            await member.roles.add(roleT);
            if (roleId2 != "") {
              await member.roles.remove(role2T);
            }
            type.push([String(reactionUsers[cV][0]), "✅"]);
          } //試験用：1175113333851050014　実用：1071290225499840512
          sendMsg(
            String(recChId),
            String(enterStamp) + ": " + String(reactionUsers[cV][0]) + cnew
          ); //試験用：1175452034338660503　実用：1177070862428549132
          await sleep(0.1 * 1000);
        } else if (
          //"🔚"
          emojiName === String(exitStampS) &&
          String(reactionUsers[cV][0]) !== "835710830417805383"
        ) {
          //はわのふ以外
          console.log("抹消？: ", String(reactionUsers[cV][0]));
          var member = await guild.members.cache.get(reactionUsers[cV][0]);
          /*console.log(member);*/
          if (await member.roles.cache.has(String(roleId))) {
            var cnew = "";
            for (let ro = 0; ro < type.length; ro++) {
              //新規でロール付与していた場合→ロール除去もリアクション削除も行わない。
              if (String(reactionUsers[cV][0]) == String(type[ro][0])) {
                cnew = "";
                break;
              }
              if (Number(ro) == type.length - 1) {
                cnew = " 🆕"; //" 🆕"
                await reactRemove(
                  messageReacted,
                  reactionUsers[cV][0],
                  String(enterStampS),
                  "1"
                ); //以前のリアクションは解除。message, userId, emojiId
                await member.roles.remove(roleT);
                if (roleId2 != "") {
                  await member.roles.add(role2T);
                }
              }
            }
            if (type.length == 0) {
              cnew = " 🆕"; //" 🆕"
              await reactRemove(
                messageReacted,
                reactionUsers[cV][0],
                String(enterStampS),
                "2"
              ); //以前のリアクションは解除。message, userId, emojiId
              await member.roles.remove(roleT);
              if (roleId2 != "") {
                await member.roles.add(role2T);
              }
            }
          } else {
            var cnew = "";
          } //試験用：1175113333851050014　実用：1071290225499840512
          sendMsg(
            String(recChId),
            String(exitStamp) + ": " + String(reactionUsers[cV][0]) + cnew
          ); //試験用：1175452034338660503　実用：1177070862428549132
          await sleep(0.1 * 1000);
        }
      } catch (e) {
        console.log(e);
      }
      cV++;
    } /*}*/
    /*    var bV = 0;
    while (bV < reactionUsers.length) {
      try {
        if (
          //"🔚"
          emojiName === String(exitStampS) &&
          String(reactionUsers[bV][0]) !== "835710830417805383"
        ) {
          //はわのふ以外
          console.log("抹消？: ", String(reactionUsers[bV][0]));
          var member = await guild.members.cache.get(reactionUsers[bV][0]);
          if (await member.roles.cache.has(String(roleId))) {
            var bnew = " 🆕";
            await reactRemove(reactMesId, reactionUsers[cV][0], String(enterStampS));//以前のリアクションは解除
          } else {
            var bnew = "";
          } //試験用：1175113333851050014　実用：1071290225499840512
          member.roles.remove(roleT);
          sendMsg(
            String(recChId),
            String(exitStamp) + ": " + String(reactionUsers[bV][0]) + bnew
          ); //試験用：1175452034338660503　実用：1177070862428549132
        }
      } catch (e) {
        console.log(e);
      }
      bV++;
    }*/
    return;
  });
}

async function reactRemove(messageReacted, userId, emojiName, type) {
  const userReactions = messageReacted.reactions.cache.filter((reaction) =>
    reaction.users.cache.has(userId)
  );

  try {
    for (const reaction of userReactions.values()) {
      if (reaction._emoji.name == emojiName) {
        await reaction.users.remove(userId);
      }
      console.log(
        "投稿",
        String(messageReacted),
        "",
        String(userId),
        "のリアクションを削除しました",
        String(type)
      );
    }
  } catch (error) {
    console.error(
      error,
      "投稿",
      String(messageReacted),
      "",
      String(userId),
      "のリアクション削除に失敗しました",
      String(type)
    );
  }
}

//審議入り・呼びかけ・リマインド
async function sinngiSt(agdURL, agdTXT, agdCGL, agdNUM) {
  console.log(
    agdURL.toString(),
    agdTXT.toString(),
    agdCGL.toString(),
    Number(agdNUM)
  );
  var sinngiIs = "",
    gityouTo = "1177070862428549132"; //議長向け通知の宛先。練習用: 1175452034338660503 実用: 1177070862428549132

  if (agdCGL.toString() == "A") {
    console.log("A");
    var channelIDs = [
      "1071303625281900574",
      "1071303655904518234",
      "1071303683020693544",
    ]; //審議室イ～ハ
  }
  if (agdCGL.toString() == "B") {
    console.log("B");
    var channelIDs = [
      "1074924206095085698",
      "1091198099264909352",
      "1096095375934369863",
      "1142050303886237766",
    ]; //審議室ニ～ト
  }
  if (agdCGL.toString() == "Y") {
    console.log("Y");
    var channelIDs = ["1071303499352117269"]; //投票所 試験用: 1168351647337029782 実用: 1071303499352117269
  }
  if (agdCGL.toString() == "Z" || agdCGL.toString() == "X") {
    console.log(agdCGL.toString());
    var channelIDs = [
      "1071303625281900574",
      "1071303655904518234",
      "1071303683020693544",
      "1074924206095085698",
      "1091198099264909352",
      "1096095375934369863",
      "1142050303886237766",
    ]; //審議室イ～ト
  }
  /*console.log(channelIDs);*/
  var now = new Date(),
    nowMinus2h = now.setHours(now.getHours() - 13); //最後の投稿から12時間に設定(botの稼働は24時間おき)-13
  console.log("呼びかけ対象時刻: ", nowMinus2h);
  /*var now2 = new Date(),
    nowMinus2h2 = now2.setHours(now2.getHours() - 24);*/ //採決のチェック。最後の投稿から24時間に設定
  const guild = await client.guilds.cache.get("1071288663884959854"); //試験用：1168349939525505054　実用：1071288663884959854
  const members = await guild.members.fetch();
  /*console.log(members);*/
  var kaishiNum = 0, //kaishiNumは上から空室の数を数える（1件目の議題は1つめの空室に、2件目の議題は2つめの空室に...）。
    kaishiNum2 = 0; //kaishiNum2は議題が入ったかどうか記録する（入れば1になる）。
  var j = 0;

  while (j < channelIDs.length) {
    /*console.log(channelIDs);*/
    try {
      var chan = channelIDs[j];
      var channel = await client.channels.cache.get(chan);

      const sleep = (second) =>
        new Promise((resolve) => setTimeout(resolve, second * 1000));

      await sleep(2);
      var response2 = await channel.messages
        .fetch({ limit: 1 })
        .then(async (messages) => {
          var lastMessage = messages.first();
          var member = await guild.members.cache.get(lastMessage.author.id);
          console.log(
            "チャンネル: ",
            chan,
            "最新の投稿: ",
            lastMessage.content
          );
          var motAfIs = await pastMessageIs(
            guild,
            channel,
            lastMessage,
            nowMinus2h,
            chan,
            gityouTo
          ).then(async function (motAfIs) {
            console.log("motAfIs[0]: ", motAfIs[0]);

            var lastMesRole = "0";
            try {
              if (await member.roles.cache.has("1089034307500249179")) {
                //なぜかfalseが返ってくる。
                var lastMesRole = "1089034307500249179";
              }
              if (await member.roles.cache.has("1100657196783632447")) {
                var lastMesRole = "1100657196783632447";
              }
              if (await member.roles.cache.has("1175447455433764966")) {
                var lastMesRole = "1175447455433764966";
              }
            } catch (e) {
              console.log(e);
            }
            console.log("lastMesRole: ", lastMesRole);
            //zの場合は、呼びかけを行う
            let toward = null,
              mesIs = null;
            if (
              agdCGL.toString() == "Z" &&
              lastMessage.createdAt.getTime() < nowMinus2h
            ) {
              await sendMsg(
                gityouTo,
                "▼---<#" + channelIDs[j].toString() + ">---"
              );

              if (
                lastMessage.content.match(
                  /^@各位\nご意見・ご質問などありましたら、引き続きぜひ述べてください。$/
                ) &&
                (lastMesRole == "1089034307500249179" ||
                  lastMesRole == "1100657196783632447" ||
                  lastMesRole == "1175447455433764966")
              ) {
                (toward = channelIDs[j]),
                  (mesIs =
                    "-----\nこちらの議題は、そろそろまとめに入りたいと思います。引き続き、意見などはぜひ述べてください。");
              } else if (
                lastMessage.content.match(
                  /^-----\nこちらの議題は、そろそろまとめに入りたいと思います。引き続き、意見などはぜひ述べてください。$/
                ) &&
                (lastMesRole == "1089034307500249179" ||
                  lastMesRole == "1100657196783632447" ||
                  lastMesRole == "1175447455433764966")
              ) {
                (toward = gityouTo),
                  (mesIs = "<@&1089034307500249179> まとめをお願いします。"); //通報チャンネル→試験用：1175452034338660503　実用：--
              } else if (
                lastMessage.content.match(
                  /（まとめは、先日載せたものを更新してこれに充てます。）/
                ) &&
                (lastMesRole == "1089034307500249179" ||
                  lastMesRole == "1100657196783632447" ||
                  lastMesRole == "1175447455433764966")
              ) {
                var matoAfC = 0, //まとめる場合は1になる
                  matoAfD = 0, //発言を挟んで採決セットを発行する場合は8か9になる
                  matoAfD2 = 1, //採決セットが過去にある場合は1になり、matoAfDを8にさせる
                  matoAfE = 1; //まとめ関連の議事進行発言が見つかるとそれぞれ「1」[9][4]になる。
                let befT = [lastMessage.id, 1]; //メッセージIDと「@各位～」のカウンタの初期値
                let winding = 50; //さかのぼるメッセージ数の初期値
                motAfIs = await tuduki(
                  guild,
                  channel,
                  nowMinus2h,
                  matoAfC,
                  matoAfD,
                  matoAfD2,
                  matoAfE,
                  befT,
                  winding
                ).then(async function (motAfIs) {
                  //採決セット発行（改定後採決）
                  await matome(motAfIs[1]);
                  (toward = gityouTo),
                    (mesIs =
                      "<@&1089034307500249179> まとめ改定の上、採決をお願いします。");
                  await sendMsg(chan, "▼処理中。本投稿消滅まで発言不可▼");
                });
              } //
              else if (
                lastMessage.content.match(
                  /今回の議論をまとめてみたのですが、これにて一旦審議終結としても異議はありませんでしょうか？/
                ) &&
                (lastMesRole == "1089034307500249179" ||
                  lastMesRole == "1100657196783632447" ||
                  lastMesRole == "1175447455433764966")
              ) {
                //採決セット発行（そのまま採決）
                await matome(lastMessage);
                (toward = gityouTo),
                  (mesIs = "<@&1089034307500249179> 採決をお願いします。");
              } else if (
                lastMessage.content.match(/^〆$/) &&
                (lastMesRole == "1089034307500249179" ||
                  lastMesRole == "1100657196783632447" ||
                  lastMesRole == "1175447455433764966")
              ) {
                (toward = gityouTo), (mesIs = "（空室）");
              } else if (motAfIs[0] == 3) {
                (toward = channelIDs[j]),
                  (mesIs =
                    "-----\nこちらの議題は、そろそろまとめに入りたいと思います。引き続き、意見などはぜひ述べてください。");
              } else if (motAfIs[0] == 1) {
                (toward = gityouTo),
                  (mesIs =
                    "<@&1089034307500249179> 新規投稿確認の上、まとめをお願いします。");
              } else if (motAfIs[0] == 9 || motAfIs[0] == 8) {
                //採決セット発行（改定後採決）
                await matome(motAfIs[1]);
                (toward = gityouTo),
                  (mesIs =
                    "<@&1089034307500249179> まとめ改定の上、採決をお願いします。");
                await sendMsg(chan, "▼処理中。本投稿消滅まで発言不可▼");
              } else if (motAfIs[0] == 80) {
                //採決セット発行（なお審議続行）
                await matome(motAfIs[1]);
                (toward = channelIDs[j]),
                  (mesIs =
                    "@各位\nご意見・ご質問などありましたら、引き続きぜひ述べてください。");
              } else {
                (toward = channelIDs[j]),
                  (mesIs =
                    "@各位\nご意見・ご質問などありましたら、引き続きぜひ述べてください。");
              }

              if (toward != "NO-SEND") {
                await sendMsg(gityouTo, mesIs);
              } //通報チャンネル→試験用：1175452034338660503　試験用2: gityouTo 実用：chan
              console.log(toward, "で", mesIs, "と発言呼びかけ");
            }
          });

          async function matome(matoMes) {
            await channel.messages
              .fetch({ before: matoMes.id, limit: 1 })
              .then(async (messages) => {
                var beforeMessage = messages.first(),
                  beforeCont = beforeMessage.content.toString(),
                  beforeURL = beforeMessage.url;
                var mesPollAgdP = beforeCont.substring(
                  beforeCont.indexOf("議題「") + 3,
                  beforeCont.indexOf("」については")
                );
                var mesPollAgd =
                  "<#" +
                  channelIDs[j].toString() +
                  "> " +
                  " " +
                  beforeURL +
                  " の議題\n" +
                  mesPollAgdP;
                await sendMsg(gityouTo, mesPollAgd);
                var mesMatome =
                  "【参考】これまでの審議まとめ\n```" +
                  beforeCont.substring(beforeCont.indexOf("→議題"));
                await sendMsg(gityouTo, mesMatome);
                var mesPollRec = "議題\n" + mesPollAgdP;
                await sendMsg(gityouTo, mesPollRec);
                var toward = "NO-SEND";
                console.log("チャンネル: ", chan, "該当の投稿: ", mesMatome);
                return [toward];
              });
          }

          //Yの場合は、結果を出力する
          if (
            agdCGL.toString() == "Y" &&
            lastMessage.content.match(/件への投票/) /*&&
            lastMessage.createdAt.getTime() < nowMinus2h2*/
          ) {
            var kennsuuT = lastMessage.content.toString();
            var numT = kennsuuT.substring(
              kennsuuT.indexOf("件") - 1,
              kennsuuT.indexOf("件")
            );
            var befT = lastMessage.id; //初期値
            for (var k = 0; k < Number(numT); k++) {
              if (k == 0) {
                var backT = 1;
              } else {
                var backT = 2;
              }
              var befT = await channel.messages
                .fetch({ before: befT, limit: backT })
                .then(async (messages) => {
                  var beforeMessage = messages.last(),
                    beforeCont = beforeMessage.content.toString(),
                    beforeURL = beforeMessage.url;
                  console.log("beforeCont", beforeCont);
                  var circleT = myPromise2(beforeMessage).then(async function (
                    emojiIs
                  ) {
                    console.log(
                      "emojiIs: ",
                      emojiIs,
                      "next befT is: ",
                      beforeMessage.id
                    );
                    var oneT = emojiIs[0] - 1,
                      twoT = emojiIs[1] - 1,
                      threeT = emojiIs[2] - 1;
                    {
                      if (oneT > twoT) {
                        var kekkaT = "可決";
                      } else {
                        var kekkaT = "否決";
                      }
                    }
                    await sendMsg(gityouTo, beforeURL);
                    var mesT =
                      "〆\n賛成" +
                      oneT +
                      "、反対" +
                      twoT +
                      "、棄権" +
                      threeT +
                      "との結果を得ました。よって本案は" +
                      kekkaT +
                      "されたものと認めます。";
                    await sendMsg(gityouTo, mesT);
                    console.log(
                      "Number(numT): ",
                      Number(numT),
                      "beforeURL: ",
                      beforeURL
                    );
                  });
                  return beforeMessage.id;
                });
            }
          }

          //X場合は、メッセージを消去する
          if (
            agdCGL.toString() == "X" &&
            lastMessage.content.match(/^▼処理中。本投稿消滅まで発言不可▼$/)
          ) {
            console.log("X 削除します: ", channelIDs[j], lastMessage.content);
            await channel.messages //マーキング「▼処理中。本投稿消滅まで発言不可▼」を削除
              .fetch(String(lastMessage.id))
              .then(async (message) => {
                message.delete();
              });
          }

          //AかBの場合は、審議すべき所に割り当てる
          if (
            (agdCGL.toString() == "A" || agdCGL.toString() == "B") &&
            (lastMessage.content.match(/^〆$/) ||
              lastMessage.content.match(
                /今回の議論をまとめてみたのですが、これにて一旦審議終結としても異議はありませんでしょうか？/
              ) ||
              lastMessage.content.match(/^▼処理中。本投稿消滅まで発言不可▼$/))
          ) {
            console.log(
              "!!!",
              agdTXT,
              kaishiNum,
              Number(agdNUM),
              lastMessage.content.match(/^▼処理中。本投稿消滅まで発言不可▼$/)
            );
            //通報チャンネル→試験用：1175452034338660503　実用：chan
            if (kaishiNum == Number(agdNUM)) {
              await sendMsg(
                gityouTo,
                "▼▼--<#" + channelIDs[j].toString() + ">---"
              );
              await sendMsg(gityouTo, agdURL); //提出されたメッセージへのリンク（URL）を送る
              await sendMsg(gityouTo, agdTXT); //議題テクストを送る
              /*await channel.messages
                .fetch({ limit: 1 })
                .then(async (messages) => {
                  //採決用メッセージを作る
                  var beforeMessage = messages.first(),
                    beforeURL = beforeMessage.url,
                    beforeCont = beforeMessage.content.toString();
                  var mesSaiketu =
                    "<#" +
                    channelIDs[j].toString() +
                    "> " +
                    beforeURL +
                    " " +
                    beforeCont;
                  await sendMsg(gityouTo, mesSaiketu);
                  console.log("チャンネル: ", chan, "該当の投稿: ", mesSaiketu);
                });*/
              await sendMsg(
                gityouTo,
                "<@&1071290225499840512> ご審議願います。"
              ); //ロール→試験用：1175113333851050014　実用：1071290225499840512
              console.log(channelIDs[j], "で", agdTXT, "の審議開始");
              await callApi(agdURL, "予約の取り消し");
              var sinngiIs = "審議開始";
              kaishiNum2++;
            }
            kaishiNum++;
          }
          if (
            (agdCGL.toString() == "A" || agdCGL.toString() == "B") &&
            (lastMessage.content.match(/^〆$/) ||
              lastMessage.content.match(
                /今回の議論をまとめてみたのですが、これにて一旦審議終結としても異議はありませんでしょうか？/
              ) ||
              lastMessage.content.match(
                /^▼処理中。本投稿消滅まで発言不可▼$/
              )) &&
            kaishiNum - 1 == Number(agdNUM) //kaishiNumは上で1足されているので、その分1引いて値を整えている。
          ) {
            var mesChk = Number(agdNUM) + 1;
            console.log(
              "審議待ち検索 稼働済み その" + agdCGL.toString() + mesChk
            );
            await sendMsg(
              gityouTo,
              "審議待ち検索 稼働済み その" + agdCGL.toString() + mesChk
            );
            return "審議開始";
          }
          console.log("j: ", j, "kaishiNum: ", kaishiNum);
          if (agdCGL.toString() == "Z" && j == channelIDs.length - 1) {
            console.log("呼びかけ 稼働済み");
            await sendMsg(gityouTo, "呼びかけ 稼働済み");
            return "呼びかけ";
          }
          if (
            (agdCGL.toString() == "A" || agdCGL.toString() == "B") &&
            kaishiNum2 == 0 &&
            j == channelIDs.length - 1
          ) {
            console.log(agdTXT, "審議室空きなし");
            await sendMsg(
              gityouTo,
              "- " + agdURL + " " + agdTXT + " 審議室空きなし"
            );
          }
          if (
            (agdCGL.toString() == "A" || agdCGL.toString() == "B") &&
            j == channelIDs.length - 1
          ) {
            var mesChk = Number(agdNUM) + 1;
            console.log(
              "審議待ち検索 稼働済み その" + agdCGL.toString() + mesChk
            );
            await sendMsg(
              gityouTo,
              "審議待ち検索 稼働済み その" + agdCGL.toString() + mesChk
            );
          }
        })
        .catch(console.error);
    } catch (e) {
      console.log(e);
    }
    j++;
  }
  return response2;
}

//まとめ予告の有無・まとめ改定の要否チェック
async function pastMessageIs(
  guild,
  channel,
  lastMessage,
  nowMinus2h,
  chan,
  gityouTo
) {
  var matoAfC = 0, //まとめる場合は1になる
    matoAfD = 0, //発言を挟んで採決セットを発行する場合は8か9になる
    matoAfD2 = 0, //採決セットが過去にある場合は1になり、matoAfDを8にさせる
    matoAfE = 0; //まとめ関連の議事進行発言が見つかるとそれぞれ「1」[9][4]になる。
  let befT = [lastMessage.id, 1]; //メッセージIDと「@各位～」のカウンタの初期値
  let winding = 4; //さかのぼるメッセージ数の初期値
  let ret = await tuduki(
    guild,
    channel,
    nowMinus2h,
    matoAfC,
    matoAfD,
    matoAfD2,
    matoAfE,
    befT,
    winding
  );
  /*if (Number(ret[0]) == 7) {
    (winding = 50), (befT = [String(ret[1]), 1]);
    ret = await tuduki(
      guild,
      channel,
      nowMinus2h,
      matoAfC,
      matoAfD,
      matoAfD2,
      matoAfE,
      befT,
      winding
    );
  }*/
  return ret;
}

//続き
async function tuduki(
  guild,
  channel,
  nowMinus2h,
  matoAfC,
  matoAfD,
  matoAfD2,
  matoAfE,
  befT,
  winding
) {
  for (var matoAf = 0; matoAf < Number(winding); matoAf++) {
    console.log("befT[0]", befT[0], "befT[1]", befT[1], "matoAfE", matoAfE);
    if (Number(befT[0]) == 1) {
      //まとめ要請
      //befTには初期値や通常のループではメッセージIDが代入されるが、うまくいった場合にはmatoAfCやmatoAfDの値が代入されている
      matoAfC = 1;
      return [1, befT[2]];
    }
    if (Number(befT[1]) == 2) {
      matoAfE = 0;
    }
    if (Number(befT[1]) == 3) {
      matoAfE = 3;
      return [3, befT[2]];
    }
    if (Number(befT[3]) == 7) {
      (matoAfD2 = 1), (matoAfE = 1);
      winding = matoAf + 50;
      console.log("befTは7", "winding", winding);
      /*return [7, befT[0]];*/
    }
    if (Number(befT[0]) == 8) {
      matoAfD = 8;
      return [8, befT[2]];
    }
    if (Number(befT[0]) == 9) {
      //採決セット発行
      matoAfD = 9;
      return [9, befT[2]];
    }
    if (befT[0] == 0) {
      console.log("END");
      return [0, 0, 0];
    }
    befT = await channel.messages
      .fetch({ before: befT[0], limit: 1 })
      .then(async (messages) => {
        /*console.log("matoAf: ", matoAf, "matoAfC: ", matoAfC);*/
        var beforeMessage = messages.first();
        var beforeCont = beforeMessage.content;
        var member = await guild.members.cache.get(beforeMessage.author.id);
        var befMesRole = "0";
        try {
          if (await member.roles.cache.has("1089034307500249179")) {
            //なぜかfalseが返ってくる。
            var befMesRole = "1089034307500249179";
          }
          if (await member.roles.cache.has("1100657196783632447")) {
            var befMesRole = "1100657196783632447";
          }
          if (await member.roles.cache.has("1175447455433764966")) {
            var befMesRole = "1175447455433764966";
          }
        } catch (e) {
          console.log(e);
        }
        /*console.log("チャンネル: ", chan, "Afの投稿: ", beforeCont, "createdAt: ", beforeMessage.createdAt.getTime(), "befMesRole: ", befMesRole);*/
        if (
          beforeMessage.createdAt.getTime() < nowMinus2h &&
          matoAfC == 0 &&
          (befMesRole == "1089034307500249179" ||
            befMesRole == "1100657196783632447" ||
            befMesRole == "1175447455433764966") &&
          beforeCont.match(/ご審議願います/)
        ) {
          return [0, 0, beforeMessage];
        }
        if (
          beforeMessage.createdAt.getTime() < nowMinus2h &&
          matoAfE == 0 &&
          (befMesRole == "1089034307500249179" ||
            befMesRole == "1100657196783632447" ||
            befMesRole == "1175447455433764966") &&
          beforeCont.match(
            /@各位\nご意見・ご質問などありましたら、引き続きぜひ述べてください。/
          )
        ) {
          matoAfE == 3;
          return [beforeMessage.id, Number(1 + Number(befT[1])), beforeMessage];
        }
        if (
          beforeMessage.createdAt.getTime() < nowMinus2h &&
          matoAfC == 0 &&
          (befMesRole == "1089034307500249179" ||
            befMesRole == "1100657196783632447" ||
            befMesRole == "1175447455433764966") &&
          beforeCont.match(
            /（まとめは、先日載せたものを更新してこれに充てます。）/
          )
        ) {
          (matoAfD = 7), (winding = 50), (matoAfD2 = 1);
          console.log("AAAA");
          return [beforeMessage.id, 0, beforeMessage, 7];
        }
        if (
          beforeMessage.createdAt.getTime() < nowMinus2h &&
          matoAfC == 0 &&
          matoAfD2 != 1 &&
          (befMesRole == "1089034307500249179" ||
            befMesRole == "1100657196783632447" ||
            befMesRole == "1175447455433764966") &&
          beforeCont.match(
            /^-----\nこちらの議題は、そろそろまとめに入りたいと思います。引き続き、意見などはぜひ述べてください。$/
          )
        ) {
          matoAfC == 1;
          return [1, 0, beforeMessage];
        }
        if (
          beforeMessage.createdAt.getTime() < nowMinus2h &&
          matoAfC == 0 &&
          (befMesRole == "1089034307500249179" ||
            befMesRole == "1100657196783632447" ||
            befMesRole == "1175447455433764966") &&
          beforeCont.match(
            /今回の議論をまとめてみたのですが、これにて一旦審議終結としても異議はありませんでしょうか？/
          )
        ) {
          if (matoAfD2 == 1) {
            matoAfD = 8;
          } else {
            matoAfD = 9;
          }
          return [Number(matoAfD), 0, beforeMessage];
        }
        return [beforeMessage.id, Number(befT[1]), beforeMessage];
      });
    if (matoAf == Number(winding) - 1 || matoAf > 200) {
      return [0, 0, 0];
    }
  }
}

//採決の検索
function myPromise2(beforeMessage) {
  return new Promise(function (resolve, reject) {
    var emojiCs = Promise.all(
      beforeMessage.reactions.cache.map(async (reaction) => {
        const emojiName = reaction._emoji.name;
        const emojiCount = reaction.count;
        const reactionUsers = Array.from(await reaction.users.fetch());
        console.log(emojiName, emojiCount);
        return emojiCount;
      })
    );
    resolve(emojiCs);
  });
}

//審議開始後の処理
async function callApi(url, hennkou) {
  try {
    var okuruNaiyou = {
      url: url,
      hennkou: hennkou,
    };
    var okuruJson = JSON.stringify(okuruNaiyou);
    const uri = String(process.env.uri1);
    const res = await fetch(uri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: okuruJson,
    });
    /*const kekka = await res.json();
    const strings = await JSON.parse(JSON.stringify(kekka));
    const data = strings["結果"];
    console.log(data)*/
    return;
  } catch (error) {
    console.log(error);
    return "APIエラーでは？";
  }
}

//クイズ用。指定したメッセージについて選択肢ごとにIDの配列を返す
async function quizReq(channelId, quizId) {
  var channelId = channelId.toString();
  var quizId = quizId.toString();
  console.log("quizId: ", quizId);
  const messageReacted2 = await client.channels.cache
    .get(channelId) //試験用：1180401046825209937　実用：1175754185271169044
    .messages.fetch(quizId);
  let mes = "?csvpoll " + channelId + "-" + quizId;
  await sendMsg("1180737032876720128", mes); //試験用：1180401046825209937　実用：1180737032876720128
  var circleT = myPromise2q(messageReacted2).then(async function (emojiIs2) {
    console.log("emojiIs2: ", emojiIs2[1]);
    await quizReturn(quizId, emojiIs2);
    return "成功です";
  });
}

function myPromise2q(beforeMessage) {
  return new Promise(function (resolve, reject) {
    var emojiCs = Promise.all(
      beforeMessage.reactions.cache.map(async (reaction) => {
        const emojiName = reaction._emoji.name;
        const emojiCount = reaction.count;
        const reactionUsers = Array.from(await reaction.users.fetch());
        console.log(emojiName, emojiCount);
        return [emojiName, reactionUsers];
      })
    );
    resolve(emojiCs);
  });
}

//同上
async function quizReturn(quizId, reactionerIds2) {
  try {
    var okuruNaiyou = {
      quizId: quizId,
      answers: reactionerIds2,
    };
    var okuruJson = JSON.stringify(okuruNaiyou);
    console.log(okuruJson);
    const uri = String(process.env.uri2);
    const res = await fetch(uri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: okuruJson,
    });
    const kekka = await res.json();
    const strings = await JSON.parse(JSON.stringify(kekka));
    const data = strings["結果"];
    console.log("data: ", data);
    return;
  } catch (error) {
    console.log(error);
    return "APIエラーでは？";
  }
}

//だるまさんがころんだ用
async function darumaCounter(channelID, comment) {
  console.log("channelID", channelID, "comment", comment);
  /*let befT = [String(fromMesID), String(fromAuth), Number(fromNum)]; //初期値*/
  const guild = await client.guilds.cache.get("1071288663884959854"); //試験用：1168349939525505054　実用：1071288663884959854
  var channel = await client.channels.cache.get(String(channelID));
  let now = new Date(),
    nowMinus2h = now.setHours(now.setHours() - 25),
    befC = 0;
  var response2 = await channel.messages //終点を決める
    .fetch({ limit: 1 })
    .then(async (messages) => {
      var lastMessage = messages.first();
      var member = await guild.members.cache.get(lastMessage.author.id);
      console.log(
        "チャンネル: ",
        channelID,
        "最新の投稿: ",
        lastMessage.content
      );
      if (comment == "START") {
        await lastMessage.react("🏁");
        return;
      }
      let act2 = await callCountApi("照会", ""),
        lMes,
        lMesId,
        lMesCont;
      (lMesId = lastMessage.id), (lMesCont = Number(lastMessage.content));
      console.log(
        "act2",
        String(act2[0][0]) == "OK" && String(act2[0][2]) != "滞留はありません"
      );
      if (
        String(act2[0][0]) == "OK" &&
        String(act2[0][2]) != "滞留はありません"
      ) {
        for (let i = 0; i < 10; i++) {
          lMes = await befTAinq(guild, channel, channelID, String(act2[0][2]));
          if (String(lMes[0]) == "OK") {
            (lMesId = lMes[1].id), (lMesCont = lMes[1].content);
            break;
          } else {
            await callCountApi("削除", "");
          }
        }
      }
      let befTA = [lMesId, 0, Number(lMesCont)],
        befIDarr = [];
      console.log("befTA[1]", befTA[1]);
      befIDarr = await befTAis(channel, channelID, befTA, befIDarr);
      console.log("befIDarr", befIDarr);
      if (befIDarr[befIDarr.length - 1][1] == 9) {
        await callCountApi("入力", String(befIDarr[befIDarr.length - 1][0]));
        /*await lastMessage.react("🏁");*/
        return;
      }
      let befT = [0, befIDarr[befIDarr.length - 1][2], 0, 0],
        bIDar2 = 0,
        bIDar3 = 0,
        esc = 0;
      for (let i = befIDarr.length; i > 1; i--) {
        //最初に空き配列があるので「1」になる
        if (befT[0] == "ERROR") {
          break;
        }
        befT = await channel.messages
          .fetch({ after: befIDarr[i - 1][0], limit: 1 })
          .then(async (messages) => {
            var beforeMessage = messages.first();
            var beforeCont = beforeMessage.content;
            var beforeAuthor = beforeMessage.author.id;
            try {
              if (
                String(beforeCont).search(/^\d|^\(/) == -1 ||
                String(beforeCont).search(/\d$|\)$/) == -1 ||
                String(beforeCont).search(/[^\d*|(\/)|(\*)|(\+)|(\-)|\(|\)]/) !=
                  -1
              ) {
                //関係ないので、参照するコンテントとオーサーIDの配列は古いままとする。
                console.log("対象外の投稿");
                esc = befT[3] - 1;
                console.log("befT[3]", befT[3]);
              } else {
                (bIDar2 = i - 1 - befT[3]), (bIDar3 = i - 1 - befT[3]);
                esc = 0;
                let eR1 = evalRep(beforeCont),
                  eR2 = evalRep(befIDarr[bIDar2][2]);
                if (
                  typeof eR1 == "number" &&
                  typeof eR2 == "number" &&
                  befIDarr[bIDar2][4] != "⚠️" &&
                  String(beforeAuthor) == String(befIDarr[bIDar3][3]) //お手つきの場合
                ) {
                  console.log(
                    beforeAuthor,
                    "に対し",
                    befIDarr[bIDar3][3],
                    "のため⚠️"
                  );
                  await beforeMessage.react("⚠️");
                  return ["ERROR"];
                } else if (
                  typeof eR1 == "number" &&
                  typeof eR2 == "number" &&
                  (befIDarr[bIDar2][2] == "⚠️" || eR1 !== eR2 + 1) //入力に誤りがある場合
                ) {
                  console.log(
                    beforeCont,
                    "に対し",
                    befIDarr[bIDar2][2],
                    "のため❌"
                  );
                  await beforeMessage.react("❌");
                  return ["ERROR"];
                } else if (
                  typeof eR1 == "number" &&
                  typeof eR2 == "number" &&
                  eR1 === eR2 + 1 //問題ない場合
                ) {
                  console.log(
                    beforeCont,
                    "に対し",
                    befIDarr[bIDar2][2],
                    "のため✅"
                  );
                  await beforeMessage.react("✅");
                  if (eR1 % 100 == 0) {
                    await beforeMessage.react("💯");
                  }
                }
              }
            } catch (e) {
              console.log(e);
            }
            return [beforeMessage.id, beforeCont, beforeAuthor, esc];
          });
      }
      await callCountApi("削除", "");
      console.log("処理が終了しました");
    });
}

async function befTAinq(guild, channel, channelID, mesID) {
  let response2,
    sig = "NA";
  try {
    response2 = await channel.messages //終点を決める
      .fetch(String(mesID))
      .then(async (message) => {
        sig = "OK";
        return [sig, message];
      });
  } catch (e) {
    response2 = ["NG", e];
  }
  console.log("befTAinq", response2);
  return response2;
}

async function befTAis(channel, channelID, befTA, befIDarr) {
  let befTAinq = 0,
    befEND = 0,
    befTA00 = befTA[0];
  //さかのぼって始点を決める
  while (Number(befTA[1]) < 1 || befEND < 1) {
    if (befTAinq == 0) {
      befTA = [];
    }
    befIDarr.push(befTA);
    if (Number(befTA[1]) >= 1) {
      befEND = 1;
      continue;
    }
    befTAinq++;
    console.log("befTAinq", befTAinq);
    if (befTAinq == 1) {
      befTA = [befTA00];
    }
    befTA = await channel.messages
      .fetch({ before: befTA[0], limit: 1 })
      .then(async (messages) => {
        var beforeMessage = messages.first();
        var beforeCont = beforeMessage.content;
        var beforeAuthor = beforeMessage.author.id;
        var check = 0,
          emr = 0; //繰り上がり終了地点とその絵文字を保存するための変数
        try {
          console.log("beforeCont", beforeCont);
          const messageReacted2 = await client.channels.cache
            .get(channelID.toString()) //試験用：1180401046825209937　実用：1175754185271169044
            .messages.fetch(beforeMessage.id);
          var circleT = myPromise2q(messageReacted2).then(async function (
            emojiIs2
          ) {
            console.log("emojiIs2", emojiIs2);
            for (let j = 0; j < emojiIs2.length; j++) {
              for (let k = 0; k < emojiIs2[j][1].length; k++) {
                console.log("id", emojiIs2[j][1][k][1].id);
                if (
                  (emojiIs2 != "" && emojiIs2[j][1][k][1].id) ==
                  "1175376490389569586"
                ) {
                  console.log("BIGIN");
                  (check = 1), (emr = j);
                  break;
                }
                if (check == 1) {
                  break;
                }
              }
            }
            if (emojiIs2 != "" && emojiIs2[emr][0] == "⚠️" && check == 1) {
              //お手つきなので同じ値から。
              return [
                beforeMessage.id,
                1,
                Number(beforeCont) - 1,
                beforeAuthor,
                "⚠️",
              ];
            } else if (
              emojiIs2 != "" &&
              (emojiIs2[emr][0] == "❌" || emojiIs2[emr][0] == "🏁") &&
              check == 1
            ) {
              //アウトなので0から。
              return [beforeMessage.id, 1, 0, "", "❌or🏁"];
            } else if (
              emojiIs2 != "" &&
              emojiIs2[emr][0] == "✅" &&
              check == 1
            ) {
              //問題ないのでその次の値から。
              return [beforeMessage.id, 1, beforeCont, beforeAuthor, "✅"];
            } else if (befTAinq > 100) {
              //ふりだしに戻る。
              return [beforeMessage.id, 9, 0, ""];
            } else {
              return [beforeMessage.id, 0, beforeCont, beforeAuthor, ""];
            }
          });
        } catch (e) {
          console.log(e);
          return;
        }

        return circleT;
      });
  }

  return befIDarr;
}
function evalRep(formulaIs) {
  console.log("formulaIs", formulaIs);
  let rep = convert_to_rpn(String(formulaIs));
  console.log("rep", rep);
  let rep2 = calculate_rpn(rep);
  console.log("rep2", rep2);
  return Number(rep2);
}

function tokenize_formura(formula) {
  let fml = String(formula).match(/(\d+(?:\.\d+)?|[-+/*()])/g);
  console.log("fml", fml);
  let prts = 0;
  for (let i = 0; i < fml.length; i++) {
    if (
      (String(fml[i - 1]) == "*" || String(fml[i - 1]) == "/") &&
      (String(fml[i + 1]) == "+" || String(fml[i + 1]) == "-")
    ) {
      console.log("A");
      fml.splice(Number(i + 1), 0, ")");
      i++;
      for (let j = i - 1; j >= 0; j--) {
        if (String(fml[j]) == ")") {
          prts++;
        }
        if (String(fml[j]) == "(") {
          prts--;
        }
        console.log("prts", prts, "fml", String(fml[j]));
        if (prts == 0 && (String(fml[j]) == "(" || j == 0)) {
          fml.splice(Number(j), 0, "(");
          i++;
          break;
        }
      }
    }
    if (
      (String(fml[i - 1]) == "+" || String(fml[i - 1]) == "-") &&
      (String(fml[i + 1]) == "*" || String(fml[i + 1]) == "/")
    ) {
      console.log("B");
      fml.splice(Number(i), 0, "(");
      i++;
      for (let j = i; j < fml.length; j++) {
        if (String(fml[j]) == "(") {
          prts++;
        }
        if (String(fml[j]) == ")") {
          prts--;
        }
        console.log("prts", prts, "fml", String(fml[j]));
        if ((prts == 0 && String(fml[j]) == ")") || j == fml.length - 1) {
          fml.splice(Number(j), 0, ")");
          i++;
          j++;
          break;
        }
      }
    }
  }
  console.log("fml(補正後)", fml);
  return fml;
}

function convert_to_rpn(formula) {
  const token = tokenize_formura(formula);
  const stack = [],
    rpn = [];

  token.forEach((tok) => {
    let op;

    if (/\d(?:\.\d+)?/.test(tok)) {
      rpn.push(Number(tok));
    } else if ("+-*/".includes(tok)) {
      const top = stack[-1];
      if (top && "*/".includes(top)) {
        rpn.push(stack.pop());
      }
      stack.push(tok);
    } else if (tok == "(") {
      stack.push(tok);
    } else if (tok == ")") {
      while ((op = stack.pop())) {
        if (op == "(") {
          break;
        }
        rpn.push(op);
      }
    } else {
      throw new Error("unknown token!");
    }
  });
  while ((top = stack.pop())) {
    if (top == "(") {
      throw new Error("unbalance parentheses");
    }
    rpn.push(top);
  }
  return rpn;
}

function calculate_rpn(rpn) {
  const stack = [];
  let n1, n2;

  rpn.forEach((tok) => {
    switch (tok) {
      case "+":
        stack.push(stack.pop() + stack.pop());
        break;
      case "-":
        n1 = stack.pop();
        n2 = stack.pop();
        stack.push(n2 - n1);
        break;
      case "*":
        stack.push(stack.pop() * stack.pop());
        break;
      case "/":
        n1 = stack.pop();
        n2 = stack.pop();
        stack.push(n2 / n1);
        break;
      case " ":
        break;
      default:
        stack.push(tok);
    }
  });
  console.log("stack", stack);
  return stack.pop();
}

//追いきれない場合（100件超過）の処理
async function callCountApi(hennkou, befMesId) {
  try {
    var okuruNaiyou = {
      hennkou: hennkou,
      befMesId: befMesId,
    };
    var okuruJson = JSON.stringify(okuruNaiyou);
    const uri = String(process.env.uri3);
    const res = await fetch(uri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: okuruJson,
    });
    const kekka = await res.json();
    const strings = await JSON.parse(JSON.stringify(kekka));
    const data = strings["結果"];
    console.log("data:", data);
    return data;
  } catch (error) {
    console.log(error);
    return [["APIエラーでは？"]];
  }
}

//VC参加
async function voiceOn(guildId, vcId, options) {
  options = JSON.parse(options);
  const guild = await client.guilds.cache.get(String(guildId));
  const channel = await client.channels.cache.get(String(vcId));
  const connection = joinVoiceChannel({
    guildId: String(guildId),
    channelId: String(vcId),
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfMute: false,
    selfDeaf: false,
  });
  /*console.log(String(options));*/
  if (String(options[0]) == "PLAY") {
    await vcOccupier("using");
    await voicePlay(guild, channel, connection, options[1]);
  }
  if (String(options[0]) == "BYE") {
    connection.destroy();
  }
}

//VC再生
async function voicePlay(guild, channel, connection, audio) {
  audio = await toBlob(audio);
  console.log("RET", typeof audio);
  console.log("T", audio);
  /*audio = createResources(audio);*/
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.play,
    },
  }); //"http://drive.google.com/uc?export=view&id= https://www.googleapis.com/drive/v3/files/"
  const resource = createAudioResource(audio, {
    inputType: StreamType.Arbitrary,
  });
  player.play(resource);
  connection.subscribe(player);
  console.log("connected");
  player.addListener("stateChange", (oldOne, newOne) => {
    if (newOne.status == "idle") {
      vcOccupier("vacancy");
      console.log("The song finished");
    }
  });
}

async function probeAndCreateResource(readableStream) {
  const { stream, type } = await demuxProbe(readableStream);
  return createAudioResource(stream, { inputType: type });
}

async function createResources(audio) {
  // Creates an audio resource with inputType = StreamType.OggOpus
  const oggStream = await probeAndCreateResource(audio);
}

async function toBlob(audio) {
  console.log("tB", typeof audio);
  /*  const stream = new Readable();
  stream.push(audio);
  stream.push(null);*/
  /*console.log("Base64:", audio);*/
  /*audio = String(audio);*/
  /*var bin = atob(String(audio).replace(/^.*,/, ''));
    var ab = new Buffer(bin.length);*/
  var buffer = Buffer.from(audio, "base64");
  /*var buffer = new Uint8Array(buffer);
    let utf8decoder = new TextDecoder();
    var buffer = utf8decoder.decode();
    /*var buffer = iconv.decode(Buffer.concat(bin), "Shift_JIS")*/ /*var buffer = new Uint8Array(ab);
    for (var i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
    }*/
  try {
    var blob = new Blob([blob], {
      type: "audio/ogg; codecs=opus;base64",
    });
  } catch (e) {
    return false;
  }
  /*const newbuf = await streamToBuffer (stream);*/
  // Create the encoder.
  // Specify 48kHz sampling rate and 2 channel size.
  console.log("buffer.length:", buffer.length);
  /*var newbuf = segmentation(buffer, 1000000); /*console.log(newbuf);*/
  /**/
  fs.writeFileSync("file.ogg", buffer);
  let file = fs.readFileSync("file.ogg");
  console.log(file);
  const stream = new Readable();
  stream.push(file);
  stream.push(null);
  /*const encoder = new OpusEncoder(48000, 2);
  const encoded = encoder.encode(buffer);
  
  /*
// Encode and decode.
const encoded = encoder.encode(buffer);*/
  /*var encoded = segench(newbuf);*/

  return stream;
}

function testblob(blob) {
  var reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = () => {
    var base64data = reader.result;
    fs.writeFileSync(
      "file.ogg",
      Buffer.from(
        base64data.replace("data:audio/ogg; codecs=opus;base64,", ""),
        "base64"
      )
    );
  };
}

function segmentation(arrayBuffer, segmentSize) {
  var segments = [];
  var fi = 0;
  while (fi * segmentSize < arrayBuffer.byteLength) {
    segments.push(arrayBuffer.slice(fi * segmentSize, (fi + 1) * segmentSize));
    ++fi;
  }
  return segments;
}
function segench(buffer) {
  let encarr = [];
  for (let i = 0; i < buffer.length; i++) {
    const encoder = new OpusEncoder(48000, 2);
    const encoded = encoder.encode(buffer[i]);
    encarr.push(encoded);
  }
  return encarr;
}

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    let i = 0;
    stream.on("readable", () => {
      let chunck;
      while (true) {
        i++;
        chunck = stream.read();
        if (chunck == null) break;
        // Specify 48kHz sampling rate and 2 channel size.
        const encoder = new OpusEncoder(48000, 2);

        // Encode and decode.
        const encoded = encoder.encode(chunck);
      }
    });
  });
}

async function vcOccupier(type) {
  try {
    var okuruNaiyou = {
      p1: type,
    };
    var okuruJson = JSON.stringify(okuruNaiyou);
    console.log(okuruJson);
    const uri = String(process.env.uri4);
    const res = await fetch(uri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: okuruJson,
    });
    const kekka = await res.json();
    const strings = await JSON.parse(JSON.stringify(kekka));
    const data = strings["結果"];
    console.log("data: ", data);
    return;
  } catch (error) {
    console.log(error);
    return "APIエラーでは？";
  }
}

//チャンネルに張られたメッセージリンクを✅付きのメッセージまでたどる
async function pdfToPngController(channelID) {
  const guild = client.guilds.cache.get("1071288663884959854"); //試験用：1168349939525505054　実用：1071288663884959854
  const channel = client.channels.cache.get(String(channelID));
  let message,
    text,
    lastMessage,
    beforeMessage,
    befMes = [],
    messageIs = 0,
    emojiIs,
    pdfIs = 0;
  let str, pgS, pgE, ctC, mesURLG, mesURLC, channelId, messageId, channel2;
  let res = null;
  console.log("befMes.length", befMes.length);

  //終点を決める
  const response2 = await channel.messages.fetch({ limit: 1 });
  lastMessage = response2.first();
  befMes.push([lastMessage.id, lastMessage.content, lastMessage]);

  for (let i = Number(messageIs); i < 10; i++) {
    let skip = 0;
    console.log("i", i);
    console.log("befMes", befMes[i]);
    messageIs = await channel.messages
      .fetch({
        before: befMes[i][0],
        limit: 1,
      })
      .then(async (messages) => {
        beforeMessage = messages.first();
        console.log("beforeMessage.id", beforeMessage.id);
        const messageReacted2 = await client.channels.cache
          .get(channelID.toString()) //試験用：1180401046825209937　実用：1175754185271169044
          .messages.fetch(befMes[i][0]);
        befMes.push([beforeMessage.id, beforeMessage.content, beforeMessage]);
        emojiIs = await myPromise2q(messageReacted2).then(async function (
          emojiIs2
        ) {
          console.log("emojiIs2", emojiIs2);
          if (emojiIs2.length > 0 && emojiIs2[0][0] == "✅") {
            console.log("emojiIs2[0][0]", emojiIs2[0][0]);
            i = 10;
            return i;
          }
          console.log("befMes[i][1]", String(befMes[i][1]));
          str = String(befMes[i][1]);
          if (str.indexOf("https://") == -1) {
            console.log("リンクなし");
            skip++;
          }
          //デフォルトはPDF全ページかつフォント優先なし。ただし誤字などは自動補正される。
          (pgS = "FR"), (pgE = "FR"), (ctC = "FALSE");
          if (
            str.indexOf(" ページ指定") != -1 ||
            str.indexOf(" フォント優先") != -1
          ) {
            if (str.indexOf(" ページ指定") != -1) {
              pgS = String(str).substring(
                str.indexOf(" ページ指定") + 6,
                str.indexOf("から")
              );
              pgE = String(str).substring(
                str.indexOf("から") + 2,
                str.indexOf("まで")
              );
            }
            if (str.indexOf(" フォント優先") != -1) {
              ctC = String(str).substring(
                str.indexOf("フォント優先") + 6,
                str.indexOf("。")
              );
              if (String(ctC) == "あり") {
                ctC = "TRUE";
              } else {
                ctC = "FALSE";
              }
            }
            mesURLG = String(str).substring(
              str.indexOf("channels/") + 9,
              str.indexOf(" ")
            );
          } else {
            mesURLG = String(str).substring(str.indexOf("channels/") + 9);
          }
          console.log("pgS?", pgS, "pgE?", pgE, "ctC?", ctC);
          str = String(mesURLG);
          console.log("str", str);
          mesURLC = String(str).substring(str.indexOf("/") + 1);
          str = String(mesURLC);
          console.log("str", str);
          channelId = String(str).substring(0, str.indexOf("/"));
          messageId = String(str).substring(str.indexOf("/") + 1);
          console.log("channelId", channelId, "messageId", messageId);
          try {
            channel2 = await client.channels.fetch(String(channelId));
          } catch (e) {
            console.warn(e);
            skip++;
          }
          console.log("ch2?", channel2);
          try {
            message = await channel2.messages.fetch(String(messageId));
          } catch (e) {
            console.warn(e);
            skip++;
          }
          console.log("mes?", message);
          try {
            if (Number(skip) == 0) {
              //空き状況の確認
              if (res == null) {
                let req = JSON.stringify({ p1: String(process.env.VOLUME2) });
                res = await fetching1(String(process.env.uri5), req);
              }
              console.log("res", res.type);
              if (String(res.type) === "OK") {
                pdfIs = pdfToPngRetriever(message, pgS, pgE, ctC, res);
              } else {
                pdfIs = "NG";
              }
            }
          } catch (e) {
            console.warn(e);
          }
          befMes[i][2].react("✅"); /*if(pdfIs == "OK"){}*/
          return;
        });
        return emojiIs;
      });
  }
}

//該当メッセージの添付ファイルを取得し、画像化して送信する
async function pdfToPngRetriever(message, pgS, pgE, ctC, res) {
  let file = null,
    pngs = null,
    mes2 = "";

  console.log(message.attachments);
  if (message.attachments == false) {
    console.log("ファイルなし");
    return;
  }

  const files = message.attachments.map((attachment) => attachment);
  const sizes = message.attachments.map((attachment) => attachment.size);
  const urls = message.attachments.map((attachment) => attachment.url);
  const ctTypes = message.attachments.map(
    (attachment) => attachment.contentType
  );
  const names = message.attachments.map((attachment) => attachment.name);
  console.log("sizes", sizes);
  console.log("urls", urls);
  console.log("ctTypes", ctTypes);
  console.log("names", names);
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      console.log("filetype", ctTypes[i]);
      if (ctTypes[i] == "application/pdf") {
        console.log(message.url, names[i], "を処理します");
        mes2 = String(message.url) + "\n" + String(names[i]);
        /*let options = { flags: null, files: null, emojis: null };
        await sendMsgWithFrags(
          message.channel.id,
          "aaa\n" + String(urls[i]),
          options
        );*/ //テスト用
        pngs = await pdfToPngDistCanvas(names[i], urls[i], pgS, pgE, ctC, res);
        if (pngs.ans == "OK") {
          let endIs = await pdfToPngSender(message.channel.id, mes2, pngs, pgS);
          if (String(endIs) == "OK") {
            console.log("送信を完了しました");
          }
        } else {
          console.warn(message.url, pngs, "変換を中止しました");
        }
      }
    }
  } else {
    console.warn(message.url, "ファイルが見つかりません");
    return;
  } //ファイルの不在を通知
}

//上の続き。1ページごとに画像化し、ファイル名を付す
async function pdfToPngDistCanvas(name, file, pgS, pgE, ctC, res) {
  let array = [];
  console.log("A");

  //urlをフェッチ
  const fileIs2 = await fetch(file)
    .then(async function (fileIs) {
      console.log(typeof fileIs, fileIs);
      const fileTxt2 = await fileIs
        .arrayBuffer()
        .then(async function (fileTxt) {
          console.log("status", fileIs.status, fileTxt);
          let res2;
          const buffer1 = Buffer.from(fileTxt);
          const bs64 = buffer1.toString("base64");
          /*let fileOn = new formdata();
        fileOn.append("type", "convertPdfToPngs");
        fileOn.append("VOLUME1", String(process.env.VOLUME1));
        fileOn.append("title", String(res.answer));
        fileOn.append("pdfTitle", String(name));
        fileOn.append("pdf", buffer1, {
          filename: "file.pdf",
          contentType: "application/pdf",
        });*/
          let fileOn = {
            type: "convertPdfToPngs",
            VOLUME1: String(process.env.VOLUME1),
            title: String(res.answer),
            pdfTitle: String(name),
            pdf: String(bs64),
            pgS: String(pgS),
            pgE: String(pgE),
            ctC: String(ctC),
          };
          let req2 = JSON.stringify(fileOn);

          res2 = await fetching2(String(process.env.uri6), req2); //formdataで送るならstringify不要
          console.log("res2", res2);
          console.log("res2-ans", res2.ans);
          if (res2.ans == "OK") {
            return res2;
          } else {
            return "NG";
          }
          //pdfを一時保存
          /*const buffer = Buffer.from(fileTxt);
      fs.writeFileSync("file.pdf", buffer, "buffer", (err) => {
        if (err) {
          console.warn(err);
        } else {
          console.log("pdfを一時保存しました。");
        }
      });
      let file = fs.readFileSync("file.pdf");
      console.log("file", file);
      const pdfData = new Uint8Array(file);
      const pdfIs2 = "";
      return pdfIs2;*/
        });
      return fileTxt2;
    })
    .catch(console.error);
  return fileIs2;
}

//上の続き。空き状況を確認する
async function fetching1(uri, okuruJson) {
  try {
    /*console.log(okuruJson);*/
    const res = await fetch(uri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: okuruJson,
    });
    const kekka = await res.json();
    const strings = await JSON.parse(JSON.stringify(kekka));
    const data = strings["結果"];
    /*console.log("data: ", data);*/
    return data;
  } catch (error) {
    console.log(error);
    return "APIエラーでは？";
  }
}

//上の続き。画像に変換してくる
async function fetching2(uri, data) {
  try {
    let cargo = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: data,
    };
    let res = await fetch(uri, cargo);
    const kekka = await res.json();
    const strings = await JSON.parse(JSON.stringify(kekka));
    console.log(strings);
    return strings;
  } catch (e) {
    console.log(e);
    return { ans: "APIエラーでは？" };
  }
}

//上の続き。6ページごとに送信する
async function pdfToPngSender(channelId, mes, pngJ) {
  let pngArray = [],
    page = Number(pngJ.pgS) - 1,
    page2 = Number(pngJ.pgS),
    name = "",
    mes2 = "",
    comIs = "";
  let pngs = JSON.parse(pngJ.pngs),
    comment = pngJ.comment;

  console.log("pngs", typeof pngs, pngs.length);
  for (let i = 0; i < pngs.length; i++) {
    page++;
    name = String(pngs[i][0]);
    const bufferIs = Buffer.from(String(pngs[i][1]), "base64");
    const attachment = new AttachmentBuilder(bufferIs, { name: String(name) });
    pngArray.push(attachment);
    if (
      Number(i) == pngs.length - 1 &&
      String(comment) == "Specify pdf pages under 49pcs."
    ) {
      comIs =
        " \n【重要】49ページを超えるPDFは一度には処理できません。49ページを超えるPDFを画像化したい場合は、ページ指定をしてください";
    }
    if ((Number(i) + 1) % 6 == 0 || Number(i) == pngs.length - 1) {
      mes2 =
        mes +
        " " +
        String(Number(page2)) +
        "～" +
        String(Number(page)) +
        "ページ目" +
        String(comIs);
      let options = { flags: null, files: pngArray, emojis: null };
      /*fs.writeFileSync(String(name), bufferIs);*/ //テスト用
      await sendMsgWithFrags(channelId, mes2, options);
      page2 = Number(page) + 1;
      mes2 = "";
      pngArray = [];
    }
  }
  return "OK";
}

//参加者のチェック
async function searchPart_controller(dataObject) {
  let list1s = JSON.parse(dataObject.list1s),
    list2s = JSON.parse(dataObject.list2s);
  let guildId,
    guildName,
    meritSys,
    reportTo,
    memberId,
    memberName,
    meritNum,
    notes;
  let meritSys1,
    meritSys2,
    reportTo1,
    reportTo2,
    newList,
    newLists = [];
  for (let i = 0; i < list1s.length; i++) {
    //基本情報を分類
    (guildId = String(list1s[i][1])),
      (guildName = String(list1s[i][2])),
      (meritSys = String(list1s[i][3])),
      (reportTo = String(list1s[i][4]));
    console.log(
      "guildId",
      guildId,
      "\nguildName",
      guildName,
      "\nmeritSys",
      meritSys,
      "\nreportTo",
      reportTo
    );
    //座布団制度処理方法の整理
    if (String(meritSys).indexOf("制度なし") == -1) {
      meritSys1 = meritSys.split(" ");
      meritSys2 = {
        type: "制度あり",
        rTguildId: String(meritSys1[1]),
        rTchannelId: String(meritSys1[2]),
        role1Requirements: String(meritSys1[3]),
        role1id: String(meritSys1[4]),
        role1color: String(meritSys1[5]),
        role2Requirements: String(meritSys1[6]),
        role2id: String(meritSys1[7]),
        role2color: String(meritSys1[8]),
      };
    } else {
      meritSys2 = { type: "制度なし" };
    }
    console.log("meritSys2", meritSys2);
    //入退通知送信方法の整理
    if (String(reportTo).indexOf("送信不要") == -1) {
      reportTo1 = reportTo.split(" ");
      reportTo2 = {
        type: "送信要す",
        rTguildId: String(reportTo1[1]),
        rTchannelId: String(reportTo1[2]),
        rThelloColor: String(reportTo1[3]),
        rTbyeColor: String(reportTo1[4]),
      };
    } else {
      reportTo2 = { type: "送信不要" };
    }
    console.log("reportTo2", reportTo2);
    newList = await searchPart_editor(
      guildId,
      guildName,
      meritSys2,
      reportTo2,
      list1s[i],
      list2s[i]
    );
    newLists.push(newList);
  }
  //送信
  await searchPart_newListSender(String(process.env.uri7), list1s, newLists);
}

//上の続き。各サーバごとに参加者を検索
async function searchPart_editor(
  guildId,
  guildName,
  meritSys2,
  reportTo2,
  list1,
  list2
) {
  /*console.log("\nguildName", guildName, "\nlist1\n", list1, "\nlist2\n", list2);*/
  let guild = await client.guilds.cache.get(String(guildId));
  let currentList = await guild.members.fetch();
  if (String(reportTo2.type).indexOf("送信不要") == -1) {
    const role1T = await guild.roles.cache.get(String(meritSys2.role1id));
    meritSys2.role1T = role1T;
    const role2T = await guild.roles.cache.get(String(meritSys2.role2id));
    meritSys2.role2T = role2T;
  }
  let newList = [];
  let change = 0,
    meritStr = "";
  /*console.log("currentList\n", currentList);*/
  let currentList2 = Array.from(currentList);
  console.log("arr\n", currentList2[0][1].displayName);

  //継続参加・新規参加の照合
  for (let i = 0; i < currentList2.length; i++) {
    (change = 0), (meritStr = "");
    for (let j = 0; j < list2.length; j++) {
      if (String(currentList2[i][0]) == String(list2[j][0]).replace("▼", "")) {
        if (
          reportTo2.type == "送信要す" &&
          String(currentList2[i][0]) != String(list2[j][0])
        ) {
          await searchPart_HelloByeSender(
            "参加: ",
            String(currentList2[i][0]),
            String(currentList2[i][1].user.username),
            reportTo2,
            String(reportTo2.rThelloColor)
          );
        }
        if (meritSys2.type == "制度あり") {
          await searchPart_meritRoleChanger(
            guild,
            String(list2[j][0]).replace("▼", ""),
            String(list2[j][1]),
            String(list2[j][2]),
            meritSys2
          );
        }
        newList.push([
          String(currentList2[i][0]),
          String(currentList2[i][1].user.username),
          String(list2[j][2]),
          String(list2[j][3]),
        ]);
        break;
      }
      if (j == list2.length - 1) {
        if (reportTo2.type == "送信要す") {
          await searchPart_HelloByeSender(
            "参加: ",
            String(currentList2[i][0]),
            String(currentList2[i][1].user.username),
            reportTo2,
            String(reportTo2.rThelloColor)
          );
        }
        if (meritSys2.type == "制度あり") {
          let nd = new Date();
          nd.setHours(nd.getHours() + 9);
          let newDate =
            nd.getFullYear() +
            "/" +
            String("0" + String(Number(nd.getMonth()) + 1)).slice(-2) +
            "/" +
            String("0" + nd.getDate()).slice(-2) +
            "-" +
            String("0" + nd.getHours()).slice(-2) +
            ":" +
            String("0" + nd.getMinutes()).slice(-2) +
            ":" +
            String("0" + nd.getSeconds()).slice(-2);
          meritStr = "0 " + newDate + " 0 " + newDate;
        }
        newList.push([
          String(currentList2[i][0]),
          String(currentList2[i][1].user.username),
          meritStr,
          "",
        ]);
      }
    }
  }
  //離脱の照合
  for (let i = 0; i < list2.length; i++) {
    (change = 0), (meritStr = "");
    for (let j = 0; j < currentList2.length; j++) {
      if (String(list2[i][0]).replace("▼", "") == String(currentList2[j][0])) {
        break;
      }
      if (String(list2[i][0]) != "" && j == currentList2.length - 1) {
        if (
          reportTo2.type == "送信要す" &&
          String(list2[i][0]).indexOf("▼") == -1
        ) {
          await searchPart_HelloByeSender(
            "離脱: ",
            String(list2[i][0]),
            String(list2[i][1]),
            reportTo2,
            String(reportTo2.rTbyeColor)
          );
          meritStr = "▼";
        }
        newList.push([
          meritStr + String(list2[i][0]),
          String(list2[i][1]),
          String(list2[i][2]),
          String(list2[i][3]),
        ]);
      }
    }
  }
  return newList;
}

//座布団枚数に応じてロールを付与・除去する。ただし、同一ロールの場合は処理しない。
async function searchPart_meritRoleChanger(
  guild,
  userId,
  userName,
  meritNum,
  meritSys2
) {
  let member = await guild.members.cache.get(String(userId));
  let meritNumArr,
    meritNum1,
    meritNum2,
    meritNum3,
    latestMN,
    beforeMN,
    nowMeritStr = "",
    color = null;
  if (String(meritNum) != "") {
    meritNumArr = String(meritNum).split(" ");
    /*console.log("meritNumArr", meritNumArr);*/
    meritNum = meritNumArr[0];
    meritNum1 = new Date(String(meritNumArr[1]).replace("-", " "));
    meritNum2 = meritNumArr[2];
    meritNum3 = new Date(String(meritNumArr[3]).replace("-", " "));
  }
  let role1up = String(meritSys2.role1Requirements).slice(
      0,
      String(meritSys2.role1Requirements).indexOf("以上")
    ),
    role1dn = String(meritSys2.role1Requirements).slice(
      String(meritSys2.role1Requirements).indexOf("以上") + 2,
      String(meritSys2.role1Requirements).indexOf("以下")
    ),
    role1T = meritSys2.role1T;
  let role2up = String(meritSys2.role2Requirements).slice(
      0,
      String(meritSys2.role2Requirements).indexOf("以上")
    ),
    role2dn = String(meritSys2.role2Requirements).slice(
      String(meritSys2.role2Requirements).indexOf("以上") + 2,
      String(meritSys2.role2Requirements).indexOf("以下")
    ),
    role2T = meritSys2.role2T;
  console.log(
    "role1up",
    role1up,
    "role1dn",
    role1dn,
    "role2up",
    role2up,
    "role2dn",
    role2dn,
    "meritNum",
    meritNum
  );
  if (String(meritNum) != "") {
    if (
      Number(role1up) <= Number(meritNum) &&
      Number(meritNum) <= Number(role1dn)
    ) {
      if (await member.roles.cache.has(String(meritSys2.role1id))) {
      } else {
        console.log("add-role1");
        await member.roles.add(role1T);
        (nowMeritStr = "新しい座布団ロールがつきました♪"),
          (color = meritSys2.role1color);
      }
      if (await member.roles.cache.has(String(meritSys2.role2id))) {
        console.log("remove-role2");
        await member.roles.remove(role2T);
      }
      latestMN = 1;
    } else if (
      Number(role2up) <= Number(meritNum) &&
      Number(meritNum) <= Number(role2dn)
    ) {
      if (await member.roles.cache.has(String(meritSys2.role2id))) {
      } else {
        console.log("add-role2");
        await member.roles.add(role2T);
        (nowMeritStr = "新しい座布団ロールがつきました♪"),
          (color = meritSys2.role2color);
      }
      if (await member.roles.cache.has(String(meritSys2.role1id))) {
        console.log("remove-role1");
        await member.roles.remove(role1T);
      }
      latestMN = 2;
    } else {
      if (await member.roles.cache.has(String(meritSys2.role1id))) {
        console.log("ELSE-remove-role1");
        await member.roles.remove(role1T);
        (nowMeritStr = "座布団ロールが外れました♪"),
          (color = meritSys2.role1color);
      }
      if (await member.roles.cache.has(String(meritSys2.role2id))) {
        console.log("ELSE-remove-role2");
        await member.roles.remove(role2T);
        (nowMeritStr = "座布団ロールが外れました♪"),
          (color = meritSys2.role2color);
      }
      latestMN = 0;
    }
    if (
      Number(role1up) <= Number(meritNum2) &&
      Number(meritNum2) <= Number(role1dn)
    ) {
      beforeMN = 1;
    } else if (
      Number(role2up) <= Number(meritNum2) &&
      Number(meritNum2) <= Number(role2dn)
    ) {
      beforeMN = 2;
    } else {
      beforeMN = 0;
    }
    if (nowMeritStr != "") {
      console.log("latestMN", latestMN, "beforeMN", beforeMN);
      if (latestMN < beforeMN) {
        nowMeritStr += "(下降)";
      } else if (beforeMN < latestMN) {
        nowMeritStr += "(上昇)";
      }
      /*let today = new Date(),
        todayMinus24h = today.setDate(today.getDate() - 1);
      console.log(todayMinus24h);
      if (Number(meritNum1.getTime()) >= Number(todayMinus24h)) {*/
      await searchPart_HelloByeSender(
        "座布団: " + nowMeritStr + "\n",
        userId,
        userName,
        meritSys2,
        color
      );
      /*}*/
    }
  }
}

//入退室通知を送る。
async function searchPart_HelloByeSender(
  type,
  userId,
  userName,
  reportTo2,
  color
) {
  let res = String(type) + String(userName) + " (@" + String(userId) + ")";
  await sendMsg(
    String(reportTo2.rTchannelId),
    "**参加者に関する通知**\n" + res
  );
  await sendEmbedMsg(
    String(reportTo2.rTchannelId),
    "参加者に関する通知",
    res,
    null,
    color
  );
}

//新しいリストを送る。
async function searchPart_newListSender(uri, list1s, newList) {
  try {
    var okuruNaiyou = {
      p1: "入力",
      p2: list1s,
      p3: newList,
    };
    var okuruJson = JSON.stringify(okuruNaiyou);
    console.log(okuruJson);
    const res = await fetch(uri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: okuruJson,
    });
    const kekka = await res.json();
    const strings = await JSON.parse(JSON.stringify(kekka));
    const data = strings["結果"];
    console.log("data: ", data);
    return;
  } catch (error) {
    console.log(error);
    return "APIエラーでは？";
  }
}

//投稿に基づく事務管理
async function meiboAudit_master(dataObject) {
  let res, channelID, recipientsArr, partyArr, stampArr, answerArr;
  try {
    let obj = {
      type: dataObject.type,
      serverURL: dataObject.serverURL,
      channel1ID: String(dataObject.channel1ID),
      channel2ID: String(dataObject.channel2ID),
      channel3ID: String(dataObject.channel3ID),
      receive: String(dataObject.receive),
      reject: String(dataObject.reject),
    };
    /*console.log("obj", obj);*/
    channelID = String(obj.channel1ID);
    //recipientsArrを収集
    res = await meiboAudit_controller(channelID);
    (recipientsArr = res), (channelID = String(obj.channel2ID));
    //partyArrを収集
    res = await meiboAudit_controller(channelID);
    partyArr = res;
    /*console.log("recipientsArr", recipientsArr, "\npartyArr", partyArr);*/
    //問い合わせ・反応
    res = await meiboAudit_sender(obj, recipientsArr, partyArr);
  } catch (e) {
    console.warn(e);
  }
  return res;
}

//チャンネルに張られたメッセージリンクを✅付きのメッセージまでたどる
async function meiboAudit_controller(channelID) {
  //'serverURL''channel1ID''channel2ID'
  /*const guild = client.guilds.cache.get("1071288663884959854");*/ //試験用：1168349939525505054　実用：1071288663884959854
  const channel = client.channels.cache.get(String(channelID));
  let lastMessage,
    beforeMessage,
    befMes = [],
    messageIs = 0,
    emojiIs;
  let textArr = [];
  console.log("befMes.length", befMes.length);

  //終点を決める
  const response2 = await channel.messages.fetch({ limit: 1 });
  lastMessage = response2.first();
  befMes.push([
    lastMessage.id,
    lastMessage.content,
    lastMessage.author.id,
    lastMessage.createdAt.getTime(),
    lastMessage,
  ]);

  for (let i = Number(messageIs); i < 100; i++) {
    console.log("i", i);
    /*console.log("befMes", befMes[i]);*/
    messageIs = await channel.messages
      .fetch({
        before: befMes[i][0],
        limit: 1,
      })
      .then(async (messages) => {
        beforeMessage = messages.first();
        console.log("beforeMessage.id", beforeMessage.id);
        const messageReacted2 = await client.channels.cache
          .get(channelID.toString()) //試験用：1180401046825209937　実用：1175754185271169044
          .messages.fetch(befMes[i][0]);
        befMes.push([
          beforeMessage.id,
          beforeMessage.content,
          beforeMessage.author.id,
          beforeMessage.createdAt.getTime(),
          beforeMessage,
        ]);
        emojiIs = await myPromise2q(messageReacted2).then(async function (
          emojiIs2
        ) {
          console.log("emojiIs2", emojiIs2);
          if (emojiIs2.length > 0 && emojiIs2[0][0] == "✅") {
            console.log("emojiIs2[0][0]", emojiIs2[0][0]);
            i = 100;
          }
          return i;
        });
        return emojiIs;
      });
  }
  console.log("befMes Now length", befMes.length);
  let j = 0;
  for (let i = befMes.length - 1; i >= 0; i--) {
    //後ろから数えて最初の二つは入れないj < 2
    if (j >= 2) {
      //配列の成形。[[種別、メッセージID、文字列、投稿者ユーザーID、投稿日時]]
      textArr.push([
        "",
        String(befMes[i][0]),
        String(befMes[i][1]),
        String(befMes[i][2]),
        String(befMes[i][3]),
      ]);
    }
    j++;
  }
  console.log("textArr Now length", textArr.length);
  return textArr;
}

async function meiboAudit_sender(obj, recipientsArr, partyArr) {
  let p1, res;
  //問い合わせ→一括反応・一括送信
  try {
    //問い合わせ
    let req = JSON.stringify({
      p1: {
        obj: obj,
        recipientsArr: recipientsArr,
        partyArr: partyArr,
      },
    });
    console.log("req", req);
    res = await fetching1(String(process.env.uri8), req);
    console.log("res.result", res.result);
    if (String(res.result) === "OK") {
      console.log(
        "res.stampArr",
        res.stampArr,
        "\nres.answerArr",
        res.answerArr
      );
      meiboAudit_bulk(obj, res.stampArr, res.answerArr);
    } else {
      console.warn("res.errorType", res.errorType);
    }
  } catch (e) {
    console.warn(e);
  }
  return res;
}

//つづき。一括反応・一括送信をする。
async function meiboAudit_bulk(obj, stampArr, answerArr) {
  let channelID, messageID, channel, mes;
  let receive = String(obj.receive),
    reject = String(obj.reject);
  console.log("receive", receive, "reject", reject);
  //一括反応
  for (let i = 0; i < stampArr.length; i++) {
    channelID = String(stampArr[i][0]);
    messageID = String(stampArr[i][1]).replace(
      String(obj.serverURL) + String(stampArr[i][0]),
      ""
    );
    channel = client.channels.cache.get(String(channelID));
    mes = await channel.messages.fetch(messageID);
    if (String(stampArr[i][2]) == "受理") {
      stampArr[i][2] = String(receive);
    } else if (String(stampArr[i][2]) == "不受理") {
      stampArr[i][2] = String(reject);
    }
    mes.react(String(stampArr[i][2]));
    await sleep(0.1 * 1000);
  }
  //一括送信
  for (let i = 0; i < answerArr.length; i++) {
    sendMsg(String(answerArr[i][0]), String(answerArr[i][1]));
    await sleep(0.1 * 1000);
  }
}

//サーバー内検索ユニット(IDからユーザー名）
function peopleInTheGuild(guildId, userId) {
  try {
    let guild = client.guilds.cache.get(String(guildId));
    let user = client.users.cache.find((user) => user.id == String(userId));
    if (!user) {
      return "ありません";
    } else {
      let memId = guild.members.cache.get(userId);
      if (!memId) {
        return "ありません";
      } else {
        console.log(`成功！${memId}`);
        let userName = String(user.username);
        return "あります" + String(userName);
      }
    }
  } catch (e) {
    console.log("失敗！", e);
    return "通信エラー" + String(e);
  }
}

//サーバー内検索ユニット(ユーザー名からID）
function peopleInTheGuild2(guildId, userName) {
  try {
    let guild = client.guilds.cache.get(String(guildId));
    let user = client.users.cache.find(
      (user) => user.username == String(userName)
    );
    if (!user) {
      return "ありません";
    } else {
      let userId = String(user.id);
      let memId = guild.members.cache.get(userId);
      if (!memId) {
        return "ありません";
      } else {
        console.log(`成功！${memId}`);
        return "あります" + String(userId);
      }
    }
  } catch (e) {
    console.log("失敗！", e);
    return "通信エラー" + String(e);
  }
}

const sleep = (milliseconds) => new Promise((_) => setTimeout(_, milliseconds));

//メッセージ送信（webhook）
async function webhook1(settings) {
  console.log(settings.webhookId);
  const webhookClient = new WebhookClient({
    id: String(settings.webhookId),
    token: String(settings.webhookToken),
  });

  let embeds = null,
    avatarURL = null,
    flags = null,
    files = null;

  if (settings.embedIs == "true") {
    embeds = new EmbedBuilder()
      .setTitle(String(settings.title))
      .setColor(String(settings.color));
    embeds = [embeds];
  }
  if (settings.avatarURL != "") {
    avatarURL = String(settings.avatarURL);
  }
  if (settings.flags != "") {
    flags = [Number(settings.flags)];
  }
  if (settings.files != "") {
    files = [String(settings.files)];
  }
  let text = String(settings.content),
    option = { embeds, flags, files };

  webhookClient
    .send({
      content: String(settings.content),
      username: String(settings.username),
      avatarURL: avatarURL,
      embeds: embeds,
      flags: flags,
      files: files,
    })
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

//メッセージ送信（添付ファイルなど）
async function sendMsgWithFrags(channelId, text, options) {
  try {
    let flags = options.flags,
      files = options.files,
      emojis = options.emojis;
    let option = { flags, files };
    let emojiStr;
    console.log("bbbbbbb", channelId, text, options);
    let sentMes = await client.channels.cache
      .get(channelId)
      .send({ content: text, flags: flags, files: files })
      .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
      .catch(console.error);
    if (emojis != null && emojis.length > 0) {
      for (let i = 0; i < emojis.length; i++) {
        if (String(emojis[i]) != "") {
          emojiStr = String(emojis[i]);
          /*console.log(emojiStr);*/
          sentMes.react(String(emojiStr));
        }
      }
    }
  } catch (e) {
    console.warn(e);
  }
}

//メッセージ送信（埋込み）
async function sendEmbedMsg(
  channelId,
  fieldTitle,
  text,
  image,
  color,
  option = {}
) {
  console.log("sendEmbedMsg", channelId, fieldTitle, text, image, color);
  /*const sleep = (second) =>
        new Promise((resolve) => setTimeout(resolve, second * 1000));

      await sleep(5);*/
  const embed = new EmbedBuilder()
    /*.setTitle('タイトル')
    .setURL('https://docs.google.com/forms/d/e/1FAIpQLSfsZqwROnrcLAs2L91KGGomlNPNXQd6mYRHBoF5LtiEFwTqcA/viewform?usp=sf_link')
    .setDescription('これはテストです')
    setThumbnail('https://uc0fc1774c9ddfcd14b588119fd0.previews.dropboxusercontent.com/p/thumb/ACHH7JQ-OMXpfc9pkKjRJYaGnOMWr70REimfZRCSOtuo35xCNNNFJjzKFRBLtuvDjmy55JCUuFVROqHkwisiP9AFYpKyOR9uiNWTtNJAmOz9UDlW-TSqQnYmzSxS446cmrR-Ntrf-UASe8PYrgqcEXZqkt-aXlSyYUxw-1MJk0VwyVxB4UVKLiylZw50hG49UPPSOQEUOkYYHLgeBuou5pQRQe-G166qCFnmepndu7mbenRhOPI3jid29XU89yrzBKFv8XACmgW1pqWYAIuHdP3T4jg6o3Qn6Eh4FcQPQhl36p8KDyvn2bf4YmXwlC-mm6Qmyi-WJ-fW0_xdV79ZmP4QReH5bIsDsCADG-C6hSAasHqjNWos66Zrt8ovRzrsgYk/p.png')*/
    .setAuthor({
      name: "だるまさん",
      iconURL:
        "https://gyazo.com/ade9df5d2f03fe9e348b884b3bb7036e/max_size/1000",
    })
    .addFields({ name: fieldTitle, value: text, inline: false })
    .setImage(image)
    .setColor(Number(color))
    .setTimestamp();

  client.channels.cache
    .get(channelId)
    .send({ embeds: [embed] })
    .then(
      console.log("埋め込みメッセージ送信: " + text + JSON.stringify(option))
    )
    .catch(console.error);
}

//メッセージ送信
async function sendMsg(channelId, text, option = {}) {
  console.log("aaaaaaa", channelId, text);
  client.channels.cache
    .get(channelId)
    .send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

function sendDm(userId, text, option = {}) {
  client.users
    .fetch(userId)
    .then((e) => {
      e.send(text, option)
        .then(console.log("DM送信: " + text + JSON.stringify(option)))
        .catch(console.error); // 1段階目のエラー出力
    })
    .catch(console.error); // 2段階目のエラー出力
}
