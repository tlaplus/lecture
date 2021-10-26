/***************************************************************************
* This file contains most of the JavaScript used by the html pages that    *
* display the video for the TLA+ Videos.                                   *
***************************************************************************/

/***************************************************************************
* Bug: On Chrome, Firefox, and who knows what other browsers, when the     *
* video is playing, moving the video position by clicking on or moving     *
* the seek bar generates an onpause event followed by an onplay event.     *
* Moving the seek button can be detected by the video player's "seeking"   *
* status with a corresponding onseeking event.  On the particular version  *
* of Firefox running on my computer on 1 Aug 2016, this onseeking event    *
* comes before the onpause event, so the stopVideo() method can read the   *
* video's seeking attribute to decide if it was called because of a seek.  *
* However, on Chrome running on my computer on the same date, the seeking  *
* property is set after the onpause event, so it looks like there's no     *
* way to determine what caused it.  A fix for that may require writing my  *
* own video controls.  A web page describing how to implement the seek     *
* bar is at                                                                *
*                                                                          *
*   https://www.developphp.com/video/JavaScript/Video-Seek-Controls-Programming-Tutorial *
*                                                                          *
* What are the chances that it really works?  So the current code works    *
* for browsers like IE in which seeking doesn't generate an onpause event  *
* and on ones like Firefox that set the "seeking" status before            *
* generating that event.  It doesn't work for browsers like Chrome that    *
* generates the onpause event and then sets the "seeking" status.          *
***************************************************************************/

/***************************************************************************
* THE FUNCTIONS                                                            *
*                                                                          *
* function onLoad(e)                                                       *
*   Executed after page loaded                                             *
*                                                                          *
* createContents(locId, content)                                           *
*   Creates a Table of Contents                                            *
*                                                                          *
* setTimeDisplays()                                                        *
*   Sets the `display' attributes of the call-out <div> elements           *
*   to indicate if they should be visible or hidden.                       *
*   Sets timedItemDue to true iff some call-out is to be displayed.        *
*                                                                          *
* function doWhilePlaying()                                                *
*   Called by any change to the video's current playing                    *
*   location, including periodically when video is playing.                *
*                                                                          *
* function pauseEvent()                                                    *
*   Executed when video is paused, and in a kludgy way by                  *
*   doWhilePlaying() to perform some needed actions.                       *
*                                                                          *
* function playEvent()                                                     *
*   Executed when playing is resumed and in a kludgy way                   *
*   by doWhilePlaying() to perform some needed actions.                    *
*                                                                          *
* function refocus()                                                       *
*   Sets the page's focus to a neutral place.                              *
*                                                                          *
* function getVideoMag()                                                   *
*   Sets videoMagnification to what it should be make the                  *
*   video as large as possible in the page's window.                       *
*   Sets the video to that size iff                                        *
*     videoState="playing" and timedItemDue = "false"                      *
*                                                                          *
* function mOverSection(obj)                                               *
* function mOutSection(obj)                                                *
*   Highlights table of contents entries when mouse moves                  *
*   over them.                                                             *
*                                                                          *
* function startVideo()                                                    *
* function stopVideo()                                                     *
*   Start and Stop video                                                   *
*                                                                          *
* function setTimeAndPlay(num)                                             *
*   Executed on table of contents click to start video at chosen spot.     *
*                                                                          *
* function createHeading()                                                 *
*   Creates the pages heading and title.                                   *
*                                                                          *
* function showHowToView()                                                 *
*   Displays the How to View page.                                         *
*                                                                          *
* function videoSkip(num)                                                  *
*   Called by skip buttons to increment/decrement playing location         *
*                                                                          *
* function  getPlaybackRate()                                              *
*   Sets video playing speed.                                              *
*                                                                          *
* function videoGetsFocus()                                                *
*   Calls refocus when video gets the focus.                               *
*                                                                          *
* function contentsButtonClick()                                           *
*   Stops video and causes table of contents to be displayed.              *
*                                                                          *
* function stopFS()                                                        *
*   Takes video out of FullScreen mode.                                    *
*                                                                          *
* function complement(b)                                                   *
*   Boolean complement on strings "true" and "false".                      *
*                                                                          *
* function FShandler(e)                                                    *
function FSerrorhandler(e)
  Full-Screen handling.
*                                                                          *
* function popup(link, windowname)                                         *
*   Displays an html file in a pop-up window.                              *
*                                                                          *
* function debug(str)                                                      *
* function testOutput(txt)                                                 *
* function newTestOutput(txt)                                              *
*   For debugging.                                                         *
***************************************************************************/

function onLoad(e) {
   /************************************************************************
   * This function should be executed after the contents of the html page  *
   * have been loaded.                                                     *
   ************************************************************************/

   /************************************************************************
   * Create the buttons that appear below the video.                       *
   ************************************************************************/
   createBelowVideo() ;

   document.getElementById("contentsButtonId").disabled = false;
   /************************************************************************
   * The following three statements were copied from instructions on       *
   *                                                                       *
   *    https://clipboardjs.com/                                           *
   *                                                                       *
   * They are part of the magic that allows the implementation of a        *
   * button to copy text from the page.                                    *
   ************************************************************************/
   var clipboard = new Clipboard('.btn'); 
   
   clipboard.on('success', function(e) { 
   }); 
   
   clipboard.on('error', function(e) { 
   }); 


  /*************************************************************************
  * The rest of this method's code consists of stuff that should be        *
  * executed after the html on the page is loaded.                         *
  *************************************************************************/
  var vid = document.getElementById("videoId");
  vid.ontimeupdate = function() {doWhilePlaying();};
     /**********************************************************************
     * Causes doWhilePlaying() to be executed every time the video         *
     * playback position changes, which occurs periodically when the       *
     * video is playing.                                                   *
     **********************************************************************/

  setTimeDisplays();
     /**********************************************************************
     * Does the appropriate thing if the video should start in video       *
     * minimized mode.                                                     *
     **********************************************************************/
     
   getVideoMag();
     /**********************************************************************
     * Sets the initial magnification of the video player.                 *
     **********************************************************************/

   refocus() ;
     /**********************************************************************
     * See comments for refocus().                                         *
     **********************************************************************/   
}    

document.addEventListener("DOMContentLoaded", onLoad); 

// "use strict";

/***************************************************************************
*                      GLOBAL VARIABLES                                    *
***************************************************************************/
var videoState = "paused";
   /************************************************************************
   * Equals "paused" or "playing", describing whether or not the video is  *
   * currently playing.                                                    *
   ************************************************************************/

var videoMinimized = "false";
   /************************************************************************
   * True iff the video is made small and either a timed item or the       *
   * table of contents is being displayed.                                 *
   ************************************************************************/
   
var timedItemDue = "false";
   /************************************************************************
   * Equals "true" or "false" depending on whether or not the video is at  *
   * a position at which a timed item (one to be shown below the video at  *
   * a specific time) should now be displayed.  It is set by               *
   * setTimeDisplays.	                                                     *
    ************************************************************************/
   
var videoMagnification = 1.0;
   /************************************************************************
   * Used to control the size of the video HTML item in normal playing     *
   * mode.  Currently, the size is obtained by multiplying the default     *
   * height and width by the value of videoMagnification.  This might be   *
   * changed to a more sophisticated approach that creates sizes that are  *
   * multiples of the default size by fractions with smaller               *
   * denominators, to minimize pixel-rounding artifacts.                   *
   ************************************************************************/


/***************************************************************************
*                             COOKIES                                      *
*                                                                          *
* Cookies are currently not used.  I started trying to write cookies to    *
* save information between video-watching sessions if the user closes      *
* and then re-opens the html file.  But at this point, the only thing      *
* that warrents saving is the position on the video of the video player.   *
* Saving that doesn't seem to be useful enough to be worth the trouble     *
* of figuring out how to make cookies work right.                          *
*                                                                          *
* In principle, saving information with cookies is trivial.  It worked     *
* fine on Internet Explorer.  However, it caused Firefox to become         *
* catatonic when loading the video.                                        *
*                                                                          *
* For future reference, cookies are read and written with the              *
* readCookie() and writeCookie() methods.  To get writeCookie() to be      *
* called when the window is closed, use                                    *
*                                                                          *
*    <body onunload="writeCookie()" ...                                    *
*                                                                          *
* For reading the cookie, I tried                                          *
*                                                                          *
*    var vid = document.getElementById("videoId");                         *
*    vid.oncanplay = function() {readCookie()} ;                           *
*                                                                          *
* so I hoped that readCookie() would be executed when the loading of the   *
* video has gotten far enough so that its action of setting the video's    *
* playing time will have the desired effect.  Perhaps it might have been   *
* better to do something else.                                             *
***************************************************************************/

var createContents = function(locId, content) {
   /************************************************************************
   * A function to construct a table of contents of a video.  Its          *
   * arguments have the following meanings.                                *
   *                                                                       *
   *    locId - The id of the html node whose child is to be               *
   *            the table of contents.                                     *
   *                                                                       *
   *    content - An array of [title, time] arrays, where:                 *
   *                title = title of section                               *
   *                time  = time of beginning of section in seconds.       *
   ************************************************************************/
  var title = document.createElement("H3");
  title.setAttribute("class", "contents");
  title.innerHTML="Contents" ;
  document.getElementById(locId).appendChild(title) ;
  var theUL = document.createElement("UL"); 
  theUL.setAttribute("class", "contents") ;
  for (var i=0; i < content.length; i++) {
    var theLI = document.createElement("LI");
    theLI.setAttribute("class", "contents");
    var theFont = document.createElement("FONT");
    theFont.innerHTML=content[i][0];
    theFont.setAttribute("onclick", "setTimeAndPlay(" + content[i][1] + ")");
    theFont.setAttribute("onmouseover", "mOverSection(this)");
    theFont.setAttribute("onmouseout", "mOutSection(this)");
    theLI.appendChild(theFont);
    theUL.appendChild(theLI);
    };
    document.getElementById(locId).appendChild(theUL);
 } ;

function createBelowVideo() {
  /*************************************************************************
  * Creates the buttons and stuff displayed right below the video.         *
  *                                                                        *
  * For some bizarre reason, on IE only, when the buttons are created      *
  * this way rather than being put into the HTML file, clicking on one of  *
  * the butttons other than arrow buttons sometimes causes the left-arrow  *
  * button to appear like it's also being clicked.  But the buttons seem   *
  * to be doing the right thing.                                           *
  *************************************************************************/
  var t = document.getElementById("below-video") ;
  t.innerHTML = 
        "<span>"
      + "&nbsp;&nbsp;"

    /* The Skip Buttons */
      + "<button onclick='videoSkip(-5)' class='leftSkip' >&larr; </button> "
      + "<label class='skip'>skip</label> "
      + "<button  onclick='videoSkip(5)' class='rightSkip'> &rarr; </button> "
      + "<button onclick='getPlaybackRate()' class='speed'>Speed</button>"

    /* The Contents button */
      + "<button onclick='contentsButtonClick()' "
      + "        id='contentsButtonId' "
      + "        class='contentsButton'>Contents</button> "
       
    /*  The HOW TO VIEW VIDEO button. */
      + "<button onclick='showHowToView()' class='help'> "
      + " &nbsp;How to View&nbsp; "
      + " </button> "

     /*********************************************************************
     * An invisible text area.  See the comments for the refocus() method  *
     * in tlavideo.js.                                                     *
     **********************************************************************/
      + "<textarea readonly id='invisibleTextArea' "
      + "     class='invisible'></textarea> "
      + " </span> " ;
}

var setTimeDisplays = function() {
   /************************************************************************
   * A function that controls what HTML elements are displayed as a        *
   * function of the playing position of the video.  It uses as its input  *
   * the array timingData, which is an array of the arrays of the form     *
   * [id, t1, t2] where:                                                   *
   *                                                                       *
   *    id = The id of an HTML element whose style.display attribute       *
   *         should be "block" when the element is displayed.              *
   *                                                                         *
   *    t1, t2 = Two integers, with t1 < t2, representing a time interval  *
   *             in seconds of playing time of the video during which      *
   *             the HTML element should be displayed.                     *
   *                                                                       *
   * The function works by setting the style.display attribute of each     *
   * array element described by the array elements in timingData to        *
   * either "block" or "none" depending on the current playing time of     *
   * the video.  It makes the table of contents visible iff there is no    *
   * element of timingData that is to be displayed.                        *
   *                                                                       *
   * It also sets timedItemDue depending on whether or not one of the      *
   * items is to be displayed.                                             *
   ************************************************************************/
   var video = document.getElementById("videoId");
   var time = video.currentTime;
   var displayToc = "true" ;
   for (var i=0; i < timingData.length; i++) {
      if ((timingData[i][2] >= time) && (time >= timingData[i][1])) {
          document.getElementById(timingData[i][0]).style.display = "block";
          displayToc = "false" ;
       }
      else {
          document.getElementById(timingData[i][0]).style.display = "none";
       }
    }

   if (displayToc === "true") {
        document.getElementById("tocId").style.display = "block" ;
        timedItemDue = "false" ;
        document.getElementById("contentsButtonId").disabled = false;

    }
   else { 
        document.getElementById("tocId").style.display = "none" ;
        timedItemDue = "true" ;
        document.getElementById("contentsButtonId").disabled = true;
    }
  };

function doWhilePlaying() {
   /************************************************************************
   * This function is called periodically while the video is playing, as   *
   * well as when any change to the videos current playing location is     *
   * made.                                                                 *
   ************************************************************************/
   setTimeDisplays();
   if (videoMinimized == timedItemDue) { }
   else {
      prevVal = timedItemDue ;
      if (timedItemDue == "true") {
           if (inFSmode === "true") {
              stopFS();
              }
            minimizeVideo() ;
           }
      else { if (videoState == "playing")  {
                unMinimizeVideo() ;         
              }
       }
     }
 }

function pauseEvent() {
   /************************************************************************
   * Executed when the video is paused, as well as by doWhilePlaying() to  *
   * perform the same resizing actions as performed by pausing the video.  *
   * (That function resets videoState to the appropriate value.)  It       *
   * re-sizes the video, and makes the Heading Section and the Bottom      *
   * Section visible.  It also takes the video out of fullscreen mode if   *
   * it is in that mode.                                                   *
   *                                                                       *
   * This should be a no-op if it was paused in minimized playing mode     *
   * (timedItemDue = "true"), but it doesn't hurt to do it.              *
   ************************************************************************/
   refocus() ;   
   var t = document.getElementById("videoId");

   /************************************************************************
   * Ignore this pause event if it was generated by the user dragging the  *
   * seek bar on Firefox (and perhaps some other browsers).  This pause    *
   * event is not generated by Internet Explorer, and this statement is a  *
   * nop on Chrome because Chrome sets the seeking property on dragging    *
   * seek bar after generating the event.                                  *
   ************************************************************************/
   if (t.seeking) {
     return ;} ;
//   if (inFSmode === "true") {
//    stopFS();
//   }
   setTimeDisplays(); 
   if ((timedItemDue === "true") || (contentsClicked === "true")) {
      contentsClicked = "false" ;  
      minimizeVideo();
    }
   videoState = "paused";
 }

function minimizeVideo() {
   /************************************************************************
   * Set the video element to its minimum size and make the heading and    *
   * make the bottom element (either a timed item or the table of          *
   * contents) visible.                                                    *
   ************************************************************************/
   var t = document.getElementById("videoId");
   t.width = 450 ;
   t.height = 250 ;
   document.getElementById("headingId").style.display = "block";
   document.getElementById("afterVideo").style.display = "block";
   document.getElementById("rightBottom").style.display = "block";
   videoMinimized = "true" ;
 }

function playEvent() {
   /************************************************************************
   * Executed when playing of the video is resumed.  If in normal playing  *
   * mode (timedItemDue = "false"), then it sets the video to its        *
   * proper size and makes the Heading Section and the Bottom Section      *
   * invisible.  It is also called by doWhilePlaying() when the video is   *
   * playing and timedItemDue changes from "true" to "false" to perform  *
   * the same resizing operations.                                         *
   ************************************************************************/
   refocus() ;  
   if (timedItemDue === "false") {
     unMinimizeVideo() ;
    };
   videoState = "playing";
   if (videoRate !== 0) 
     { document.getElementById('videoId').playbackRate = videoRate;
       videoRate = 0 ;
     }
 }

function unMinimizeVideo() {
   /************************************************************************
   * Make video the maximum size allowed by the window, and make           *
   * invisible the heading and the stuff below the video's buttons.        *
   ************************************************************************/
   document.getElementById("afterVideo").style.display = "none";

   // Logic would say that the command above would blank out everything
   // inside the <div> element with id = "afterVideo".  But logic is not
   // something understood by the people who designed this whole web
   // nonsense.  So, the following command is also necessary:
   document.getElementById("rightBottom").style.display = "none";

   document.getElementById("headingId").style.display = "none";

   var t = document.getElementById("videoId");
   t.width = 900 * videoMagnification ;
   t.height = 500 * videoMagnification ;
   videoMinimized = "false";
 }

function refocus() {
  /*************************************************************************
  * For reasons described below, this command gives the focus to an        *
  * invisible <textarea> element immediately to the right of the "How to   *
  * View" button.  (A <textarea> is the most innocuous type of element to  *
  * which focus can be given.)                                             *
  *                                                                        *
  * This function is called when handling a button click, because leaving  *
  * the focus on the button would cause the button to be "clicked" by the  *
  * user typing a space to start or stop the video.                        *
  *                                                                        *
  * The function is also called to fix the following problem with the      *
  * Firefox browser.  It appears that calling the play() and pause()       *
  * commands on the video have no effect if the video element has the      *
  * focus--which it of course does after play() or pause() is executed.    *
  * The result is that the startVideo() and stopVideo() commands, which    *
  * are called when the user types a space, have no effect on Firefox      *
  * when the video has focus.  The refocus() function is called            *
  *************************************************************************/
  document.getElementById("invisibleTextArea").focus();
}

function getVideoMag() {
  /*************************************************************************
  * This function is supposed to compute the value of videoMagnification   *
  * that will show the video and the skip buttons at their maximum size.   *
  *                                                                        *
  * The constants 888 and 500 come from the fact that Camtasia is set to   *
  * make videos 888 X 500 pixels, so this will give the screen the right   *
  * width/length ratio to display them properly.                           *
  *************************************************************************/
  videoMagnification = Math.min((window.innerWidth-10)/(888),  
                                (window.innerHeight-43)/500) ; 
             // For some reason I don't understand, the -10 is needed to 
             // prevent a horizontal scrollbar from appearing in
             // some situations.
  if (// (videoState === "playing") && 
      timedItemDue === "false") {
    var t = document.getElementById("videoId");
    t.width  = 888 * videoMagnification ;
    t.height = 500 * videoMagnification ;
   }
 }

/***************************************************************************
* Functions mOverSection(obj) and mOutSection(obj) are called when the     *
* mouse has moved over and out of the object obj that represents a line    *
* in the table of contents                                                 *
***************************************************************************/
function mOverSection(obj) {
     obj.setAttribute("color","red");
}

function mOutSection(obj) {
     obj.setAttribute("color","black");
}

/***************************************************************************
* The startVideo() and stopVideo() do nothing but what their names imply;  *
* they do not depend on or make any changes to the state variables.        *
***************************************************************************/
function startVideo(){
   var t = document.getElementById("videoId");
   t.play();
}

function stopVideo(){
   var t = document.getElementById("videoId");
   t.pause();
}

function setTimeAndPlay(num) {
   /************************************************************************
   * Sets the videos current playing time to num seconds and starts        *
   * playing the video.  Used to implement table of contents.              *
   ************************************************************************/
   var t = document.getElementById("videoId");
   t.currentTime=num;
   videoState = "playing";
   t.play();
  }



   
// var prevVal = timedItemDue ;
   /************************************************************************
   * Used by the doWhilePlaying() function to detect if timedItemDue     *
   * has changed.                                                          *
   ************************************************************************/

// var test = "true";

function createHeading() {
   /************************************************************************
   * Creates a heading on the page with contents HEADING and sets the      *
   * page's title appropriately.                                           *
   ************************************************************************/
   var t = document.getElementById("h1Id") ;
   t.innerHTML = HEADING ; 
   t = document.getElementById("titleId") ; 
   t.innerHTML = "TLA+ Course Lecture: " + HEADING ; 
  }


//function keyPress(oPEvt) {
//   var oEvent = oPEvt || window.event;
//   var nChr = oEvent.charCode;
//   if ( // ((nChr >= 65) && (90 >= nChr))
//        // || ((nChr >= 97) && (122 >= nChr))
//        // || 
//       (nChr == 32)                     ){
//     if (videoState === "paused") {
//           startVideo() ;}
//      else {
//         stopVideo() ;} ;
//      }
// };



document.onkeypress = function (oPEvt) {
   /************************************************************************
   * This method starts or stops the video when a letter or space is       *
   * typed.  The function is not called if the letter is typed when the    *
   * focus is in in an input area or someplace else where input can be     *
   * entered.  It is also not called when certain letters are typed when   *
   * the focus is in the <video> element.  On IE, those letters seem to    *
   * be the lower-case letters 'a', 'j', 'k', 'm', 't', 'u', 'z'.  See     *
   *                                                                       *
https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onkeypress

   *                                                                       *
   * This method should probably be changed to respond only to a space,    *
   * which on both IE and Firefox works when the focus is in the           *
   * video--though in that case, the spec is caught by the video viewer.   *
   * However, for that, it's necessary that buttons and such things that   *
   * might be affected by a space if they have the focus should give the   *
   * focus to the <video> element.                                         *
   ************************************************************************/
   var oEvent = oPEvt || window.event;
   var nChr = oEvent.charCode;
   if ( // ((nChr >= 65) && (90 >= nChr))
        // || ((nChr >= 97) && (122 >= nChr))
        // || 
       (nChr == 32)                     ){
     if (videoState === "paused") {
           startVideo() ;}
      else {
         stopVideo() ;} ;
      }
 };


function showHowToView() {
  /*************************************************************************
  * Here is where the help button contents is produced.  The best size     *
  * depends on the contents of the page.  At one time, the following were  *
  * the ideal sizes for various browsers:                                  *
  *                                                                        *
  *       IE:      510 X 750                                               *
  *       Edge:    510 X 750                                               *
  *       FireFox: 515 X 800                                               *
  *       Chrome:  510 X 745                                               *
  *************************************************************************/
   var height = 765 ;
   var width  = 535 ;
   var maxheight = 0.9 * screen.height;
   if (height > maxheight) { height = maxheight ;}

   window.open("how-to-view-video.html", "How to View the Video",
   "resizable=yes,width=" + width + ",height=" + height + 
     ",scrollbars=yes,menubar=no,titlebar=no");
  refocus() ;
}


function videoSkip(num) {
   /************************************************************************
   * Causes the video to skip forward by num seconds (or backwards by      *
   * -num seconds).  It is triggered by the skip buttons.                  *
   ************************************************************************/

   var video = document.getElementById("videoId");

   var t = video.currentTime;
   video.currentTime = t + num;
   // Take focus off the button, so typing a space doesn't trigger it.
   refocus() ;
 }

/***************************************************************************
* videoRate will be 0 except if it is set by getPlaybackRate() while the   *
* video is paused.  In that case, the playEven() method uses it to set     *
* the playing speed.                                                       *
***************************************************************************/
var videoRate = 0;

function  getPlaybackRate()
   /************************************************************************
   * Sets the playing speed of the video, based on code at                 *
   *                                                                       *
   *    https://gist.github.com/wka/3056982                                *
   *                                                                       *
   * recommended by Durant Schoon.  This setting may or may not be reset   *
   * when the video is stopped, depending on the browser.  Hopefully,      *
   * that behaves the same as the control provided by the browser's video  *
   * player.                                                               *
   ************************************************************************/
   { refocus() ;
     videoRate = 0 ;
     videoRate = prompt(
          'Enter new video playback rate, a number between 0 and 5, \nwhere' +
          ' 1 is normal, .5 is half as fast, and 2.0 is twice as fast.'); 
     var id = document.getElementById('videoId');
     if ((videoRate > 0) && (5.1 > videoRate))
       { id.playbackRate = videoRate; } ;
     if (! id.paused) {videoRate = 0 ;};
    } 


function videoGetsFocus() {
  /*************************************************************************
  * This function is called when the Web page's <video> element gets the   *
  * focus.  See the comments for the refocus() method.                     *
  *************************************************************************/
  refocus();
 }

var contentsClicked = "false" ;
  /*************************************************************************
  * Set to "true" when the user clicks on the Contents button.  It is      *
  * reset to false when the Table of Contents is displayed.  It's not      *
  * clear what should happen if the button is pushed when the video is     *
  * minimized because it is displaying something else, so the button is    *
  * disabled when that is the case.  It should probably be disabled when   *
  * the contents is being displayed, but that doesn't seem worth the       *
  * trouble.                                                               *
  *************************************************************************/
  
function contentsButtonClick(){
debug("contentsButtonClick");
  contentsClicked = "true" ;
  refocus() ;
  if (videoState === "paused") {
    pauseEvent() ;
  }
  else { stopVideo(); }
 }

/***************************************************************************
*                  HANDLING FULL SCREEN  MODE                               *
*                                                                          *
* The following code was stolen from                                       *
*                                                                          *
*    https://www.sitepoint.com/use-html5-full-screen-api/                  *
*                                                                          *
* That web page apparently contains the correct code for taking a video    *
* out of full-screen mode.  However, its code for putting a video into     *
* full-screen mode works only on a command that is intiated by an action   *
* of the user.  By the logic of web designers, clicking on a button is an  *
* action of the user but typing a command isn't.  In any case, the         *
* passage of time is not an action of the user, so it's hopeless to try    *
* to keep the video in full-screen mode when the user wants it there and   *
* still minimize the video when appropriate.  So, the video is taken out   *
* of full-screen mode when the video is minimized.  Weird things may       *
* happen if the user puts the video in full-screen mode while it is        *
* minimized.                                                               *
***************************************************************************/

var inFSmode = "false" ;
   /************************************************************************
   * True iff the video is in full-screen mode.  It is maintained by the   *
   * "fullscreenchange" event handler.                                     *
   ************************************************************************/

function stopFS() { 
   /************************************************************************
   * The function that takes the video player out of fullscreen mode.      *
   ************************************************************************/
   if (document.exitFullscreen) {
      document.exitFullscreen();
   } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
   } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
   } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
   } ;
   getVideoMag();
}

/***************************************************************************
* Add the fullscreenchange and fullscreenerror handlers.                   *
***************************************************************************/
document.addEventListener("fullscreenchange", FShandler);
document.addEventListener("webkitfullscreenchange", FShandler);
document.addEventListener("mozfullscreenchange", FShandler);
document.addEventListener("MSFullscreenChange", FShandler);

document.addEventListener("fullscreenerror", FSerrorhandler);
document.addEventListener("webkitfullscreenerror", FSerrorhandler);
document.addEventListener("mozfullscreenerror", FSerrorhandler);
document.addEventListener("MSFullscreenError", FSerrorhandler);

function complement(b) {
   /************************************************************************
   * JavaScript uses the insane C convention that 0 means false and any    *
   * other integer means true, and makes it even more insane by having     *
   * some other values that mean false or true.  So, I use "true" and      *
   * "false" for Boolean values.  This is the negation operator.           *
   ************************************************************************/
   if (b === "true") { return "false" ;}
   else if (b == "false") { return "true" ;}
   else { alert ("Non-Boolean used as Boolean"); }
}


/***************************************************************************
* The change of full-screen moee event handler.                            *
***************************************************************************/
function FShandler(e) { 
   inFSmode = complement(inFSmode) ;
} 

function FSerrorhandler(e) 
   /************************************************************************
   * I don't know what to do if an error occurs.                           *
   ************************************************************************/
   { alert (
      "You triggered a bug in the JavaScript code for minimizing the video\n" +
      "when it's in full-screen mode.  If things are in a weird state,\n" +
      "try maximizing the video (with its controls) or un-maximizing it\n" +
      "(which you can probably do with the Escape key).");} 


function popup(link, windowname) {
  /*************************************************************************
  * Displays the html file whose name (a string) is link in a pop-up       *
  * window.  windowname is a string that should be a unique name for the   *
  * window.                                                                *
  *************************************************************************/
  window.open(link, windowname, 'width=720,scrollbars=yes,resizable=yes');
}

/**************************************************************************
* For Testing                                                              *
**************************************************************************/

/***************************************************************************
* Execute doWhilePlaying() periodically for testing.                       *
***************************************************************************/
// setTimeOut(doWhilePlaying,500);

function debug(str) {
  /*************************************************************************
  * Just for debugging.                                                    *
  *************************************************************************/
// document.getElementById("testlabel").innerHTML =
// document.getElementById("testlabel").innerHTML + " " + str;

//  alert("" + str + " with" +
//    "\n videoMin = " + timedItemDue + 
//    "\n inFS = " + inFSmode + 
//    "\n userWant = " + userWantsFSmode + 
//    "\n auto = " + automaticFSmodeChange) ;
}

var testout = true;

function testOutput(txt)
   { if (testout) {
      document.getElementById("test-area").innerHTML =
       document.getElementById("test-area").innerHTML + txt ;
     }
   }

function newTestOutput(txt)
   { if (testout) {
      document.getElementById("test-area").innerHTML =
       txt ;
     }
   }

