/*! movingimage Kollective plugin for Bitmovin v0.1.0. Copyright (c) 2018 movingimage EVP GmbH, all rights reserved.
 * Authors: rico.slaby@movingimage.com, matthew.dodds@movingimage.com */

export function installBitmovinPlugin(player) {
    // Install a custom interface for Bitmovin player
    var bitmovinInterface = {
        setSource: function (player, src, type, isThroughECDN) {
            console.log("setSource", player);
            var source = {
                hls: src
            };
            console.log("setSource", source);

            player.load(source);
            // player.play(); // most likely will be rejected by Safari and Chrome
        },
        isPlaying: function (player) {
            console.log("isPlaying", player);
            return player.isPlaying();
            //return !(player.seeking || player.paused || player.ended);
        },
        isLive: function (player) {
            console.log("isLive", player);
            return !isFinite(player.getDuration());
        },
        getPlayerPosition: function (player) {
            console.log("getPlayerPosition", player);
            return player.getCurrentTime() * 1000;
        },
        getPlayerDuration: function (player) {
            console.log("getPlayerDuration", player);
            return player.getDuration() * 1000;
        },
        setEventHandlers: function (player, handlers) {
            console.log("setEventHandlers", player);

            player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, handlers.onTimeUpdate);
            player.addEventHandler(bitmovin.player.EVENT.ON_ERROR, handlers.onError);
            player.addEventHandler(bitmovin.player.EVENT.ON_PAUSED, handlers.onPause);
            player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, handlers.onPlay);
            player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, handlers.onEnd);
            player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, handlers.onSeekEnd);
            player.addEventHandler(bitmovin.player.EVENT.ON_STALL_ENDED, handlers.onBuffering);
            player.addEventHandler("canplaythrough", handlers.onCanPlay);
        }
    }

    ksdn.installPlayerPlugin("Bitmovin", bitmovinInterface);
}

export function playKollective(plugin, player, urn) {
    plugin.play(player, urn, {
        onPlaybackRequestSuccess: function (plugin, info) {
            console.log("onPlaybackRequestSuccess: " + info.moid);
        },
        onPlaybackRequestFailure: function (plugin, request) {
            console.log("onPlaybackRequestFailure:", request);
            return true;
        },
        onAgentDetected: function (plugin, supportsSessions, agent) {
            var agentData = plugin.getAgentData();
            var version = agentData.version;
            var urnPrefix = agentData.urn_namespace;
            console.log("onAgentDetected: supportsSessions=" + supportsSessions + ", agentVersion=" + version + ", urnNamespace=" + urnPrefix);
        },
        onAgentRejected: function (plugin, criteria) {
            if (!criteria.provisionedForCurrentUrn) {
                console.log("Agent detected but not provisioned for URN");
            }
            if (!criteria.notBlackedOut) {
                console.log("Agent detected but is currently blacked out");
            }
        },
        onAgentNotDetected: function (plugin, reasons) {
            console.log("onAgentNotDetected");
            console.log(reasons);
        },
        onSessionStart: function (plugin) {
            console.log("onSessionStart");
        },
        onSessionFailure: function (plugin) {
            console.log("onSessionFailure");
        },
        onPrimingStart: function (plugin) {
            console.log("onPrimingStart");
        },
        onPrimingFailure: function (plugin) {
            console.log("onPrimingFailure");
        },
        onProgress: function (plugin, progress, urn) {
            console.log("onProgress: " + progress + " (" + urn + ")");
        },
        onCommand: function (plugin, command, data) {
            console.log("onCommand: " + command);
        },
        willSetSource: function (plugin) {
            console.log("willSetSource");
        },
        didSetSource: function (plugin) {
            console.log("didSetSource");
        }
    });
}