
describe("RUM", function() {

    
    
    
  beforeEach(function() {

    

    
    
  });
  
  it("should have the window.onerror being set to 'computeJSerrors'", function() {
    expect(window.onerror.name.indexOf("computeJSerrors") > -1 ).toBeTruthy();
  });
    
  it("should exist an observer for the print tracking on the window object", function() {
    expect(window.onbeforeprint.toString().indexOf("trackPrint") > -1).toBeTruthy();
  });
  
  it("should be an observer on the document triggering pageViewsInCache incrementation", function() {
    var result = false;
    $($._data(document, "events").click).each(function(i,el){
        if(el.handler.toString().indexOf("incrementClicksInCache") > -1)
          result = true;
    });
    expect(result).toBeTruthy();
  });
  
  
  
    
  //it("should be able to play a Song", function() {
  //  player.play(song);
  //  expect(player.currentlyPlayingSong).toEqual(song);
  //
  //  //demonstrates use of custom matcher
  //  expect(player).toBePlaying(song);
  //});
  //
  //describe("when song has been paused", function() {
  //  beforeEach(function() {
  //    player.play(song);
  //    player.pause();
  //  });
  //
  //  it("should indicate that the song is currently paused", function() {
  //    expect(player.isPlaying).toBeFalsy();
  //
  //    // demonstrates use of 'not' with a custom matcher
  //    expect(player).not.toBePlaying(song);
  //  });
  //
  //  it("should be possible to resume", function() {
  //    player.resume();
  //    expect(player.isPlaying).toBeTruthy();
  //    expect(player.currentlyPlayingSong).toEqual(song);
  //  });
  //});
  //
  //// demonstrates use of spies to intercept and test method calls
  //it("tells the current song if the user has made it a favorite", function() {
  //  spyOn(song, 'persistFavoriteStatus');
  //
  //  player.play(song);
  //  player.makeFavorite();
  //
  //  expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  //});
  //
  ////demonstrates use of expected exceptions
  //describe("#resume", function() {
  //  it("should throw an exception if song is already playing", function() {
  //    player.play(song);
  //
  //    expect(function() {
  //      player.resume();
  //    }).toThrow("song is already playing");
  //  });
  //});
});