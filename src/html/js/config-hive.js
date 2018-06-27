var loadTimer = performance.now();
var uiConfig;
var uiManager;

var conf = {
    key: 'e28cc092-28eb-4f25-aa30-ed9e5b878668',
    source: {
      hls: null
    },
    style: {
      ux: false
    },
    playback: {
      autoplay: true,
      playsInline: true
    },
    logs: {
      bitmovin: false
    }
};

// Simple logging function
function logIt(element, newText) {
  $(element).val(function(i, curText) {
    return curText + newText + '\n';
  });
}

// Get the Hive ticket
var ticket = new URL(location.href).searchParams.get('t');
var DEFAULT_TICKET = 'https://api-test.hivestreaming.com/v1/events/9002/10001/212/moB8hd3L7ATwczEn';
try {
  new URL(ticket);
} catch (e) {
  ticket = DEFAULT_TICKET;
} finally {
  logIt('#console-output', ticket);
};

// Reference the Bitmovin player
var player = bitmovin.player('player');

// Add Hive goodness to the player
bitmovin.initHiveSDN(player, {debugLevel: 'info', hiveTechOrder: ['HiveJava']});

// Configure Hive enabled player
player.initSession(ticket).then(function(session) {
  logIt('#console-output', 'Hive OK 👍🏼' + '\nResolved Manifest: ' + session.manifest + ', Tech: ' + session.tech);

  // Try with Hive Session Manifest first
  conf.source.hls = session.manifest;
  player.setup(conf).then(function(value) {
    uiManager = bitmovin.playerui.UIManager.Factory.buildAudioVideoUI(player, uiConfig);
    $('#player-version').text(bitmovin.player.version);
    logIt('#console-output', 'Streaming via Hive 😎');
  }, function(reason) {
    logIt('#console-output', 'Streaming via Hive failed (' + reason.code + ' ' + reason.message + ') 😖');
  });
}, function(error) {
  logIt('#console-output', 'Streaming via Hive failed 😖');
  logIt('#console-output', error.code + ' - ' + error.message);
  logIt('#console-output', 'Trying direct HLS source...');
  conf.source.hls = sources.live.hls;
  player.setup(conf).then(function(value) {
    uiManager = bitmovin.playerui.UIManager.Factory.buildAudioVideoUI(player, uiConfig);
    $('#player-version').text(bitmovin.player.version);
    logIt('#console-output', 'Streaming via direct HLS source 😎');
  }, function(reason) {
    logIt('#console-output', 'Streaming via direct HLS source failed (' + reason + ') 😖');
    logIt('#console-output', error.code + ' - ' + error.message);
  });

});

// Done loading the player
logIt('#console-output', 'Load Time: ' +  Math.round(performance.now() - loadTimer, 2) +  ' ms');

// Fill the sources
$.each(sources, function(key, value) {
  $('#config-source').append($('<option></option>').attr('value', key).text(value.title));
});

$('#config-source').change(function() {
  player.unload();
  player.load(sources[$(this).val()]);
});

// Fill the player versions
$.each(players, function(key, value) {
  $('#config-version').append($('<option></option>').attr('value', value.src).text(value.desc));
});

$('#config-version').change(function() {
  var theLoc = new URL(location.href);
  location.href = theLoc.origin + theLoc.pathname + '?v=' + $(this).val();
});

// Collect all UI factory methods which are basically the different built-in skins and skin types
var uiFactoryMethods = [];
for (var member in bitmovin.playerui.UIManager.Factory) {
  if (typeof bitmovin.playerui.UIManager.Factory[member] == 'function' && member.indexOf('build') === 0) {
    uiFactoryMethods.push(member);
  }
}

// Fill the UI factory method select box
$.each(uiFactoryMethods, function(key, value) {
  $('#config-ui').append($('<option></option>').attr('value', value).text(value));
});

// Refresh UI when a factory is selected
$('#config-ui').change(function() {
  uiManager.release();
  var factoryMethod = $(this).val();
  uiManager = bitmovin.playerui.UIManager.Factory[factoryMethod](player, uiConfig);
});

// Report cuepoint metadata
player.addEventHandler(bitmovin.player.EVENT.ON_METADATA, function(data){
  var decodedFrames = [];
  data.metadata.frames.forEach(function(frame) {
    if (typeof frame.data !== 'string' && frame.key[0] === 'T') {
      var byteArray = Object.keys(frame.data).map(function(key) { return frame.data[key]; });
      byteArray = byteArray.slice(1, byteArray.length - 1);
      var decoded = String.fromCharCode.apply(null, new Uint8Array(byteArray));
      decodedFrames.push({ key: frame.key, data: decoded });
    } else {
      decodedFrames.push(frame);
    }
  });
  logIt('#console-output', 'Data: ' + decodedFrames[decodedFrames['length']-1].data + '\nTime: ' + player.getCurrentTime() + 's\n');
});
