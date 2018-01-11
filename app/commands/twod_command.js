let AbstractBaseCommand = require('../abstract_base_command');

const request = require('request');
//const search_url = 'https://www.wastedondestiny.com/api';

/*  this API key is one i created for sbfvgs, keep in mind that we all might be using it at the same time
    so just keep that in mind to avoid rate limit issues    */

const headers = {
    'Accept': 'application/json',
    'X-API-Key': '4526f02876ba4fbc92883d3eb732a955'
};


class TimeWastedOnDestiny extends AbstractBaseCommand {
    /**
     * {string} name The Name of this Command
     * {boolean} adminOnly (optional).  if it can only be run by administrators.
     */
    constructor() {
        super("twod", false, "how many days username has wasted on destiny. defaults to playstation");
    }

    /**
     * @param {Object} message A discordjs Message object.  
     * info:  https://discord.js.org/#/docs/main/stable/class/Message
     */
    do(message) {
        let params = super.getParams(message.content, this.name);
        let username = params.match(/\b(?:\W|[0-9])*(\w+)\b/)[0];
        let device = 2;
        if (params.toLowerCase().search("xbox") !== -1) device = 1;

        let details = "/" + device + "&user=" + username;

        let lookup_resource = `https://www.bungie.net/Platform/Destiny/${device}/Stats/GetMembershipIdByDisplayName/${username}`;

        let opts = {
            url: encodeURI(lookup_resource),
            headers: headers
        };

        request(opts, function (error, response, body) {
            console.log(body);
            if (!error && response.statusCode === 200) {
                let info = JSON.parse(body);
                console.log(`bungo id for ${username} is ${info.Response} `);
                let lookup_resource = `https://www.bungie.net/Platform/Destiny2/${device}/Profile/${info.Response}/?components=200`;

                let opts = {
                    url: encodeURI(lookup_resource),
                    headers: headers
                };

                if (info.Response != "0") {
                    request(opts, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            let info = JSON.parse(body);
                            let totalTime = 0;
                            let characters = Object.keys(info.Response.characters.data);
                            characters.forEach(id => {
                                totalTime += Number(info.Response.characters.data[id].minutesPlayedTotal);
                            })
                            message.channel.sendMessage(`${username} has wasted over ${Math.floor(totalTime * 0.000694444)} days playing destiny!`);
                        }
                    });
                } else {
                    message.channel.sendMessage(info.ErrorStatus);
                }
            }
        });
    }
}

module.exports = TimeWastedOnDestiny;