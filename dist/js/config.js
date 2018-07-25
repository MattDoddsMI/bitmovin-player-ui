var loadTimer = performance.now();
var uiConfig;
var uiManager;

var conf = {
    key: 'e28cc092-28eb-4f25-aa30-ed9e5b878668',
    source: {
      title: sources.live.title,
      hls: sources.live.hls
    },
    style: {
      ux: false
    },
    playback: {
      autoplay: false,
      playsInline: true
    },
    logs: {
      bitmovin: false
    },
    tweaks: {
      startup_threshold: 0.1
    }
};

// Simple logging function
function logIt(element, newText) {
  $(element).val(function(i, curText) {
    return curText + newText + '\n';
  });
}

// Reference the Bitmovin player
var player = bitmovin.player('player');

player.setup(conf).then(function(value) {
    // Add UI to loaded player
    // uiManager = bitmovin.playerui.UIManager.Factory.buildDefaultUI(player, uiConfig);
    uiManager = bitmovin.playerui.UIManager.Factory.buildAudioVideoUI(player, uiConfig);
    // uiManager = bitmovin.playerui.UIManager.Factory.buildAudioOnlyUI(player, uiConfig);
    // success
    logIt('#console-output', 'Created successfully - ' + bitmovin.player.version + '\n');
    $('#player-version').text(bitmovin.player.version);
}, function(reason) {
    // Play setup failed, and there's no player UI yet to display the error in
    logIt('#console-output', 'Error: ' + reason.code + ' - ' + reason.message + '\n');
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
