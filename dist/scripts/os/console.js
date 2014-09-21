///<reference path="../globals.ts" />
/* ------------
Console.ts
Requires globals.ts
The OS Console - stdIn and stdOut by default.
Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, consoleHistory, historyIndex) {
            if (typeof currentFont === "undefined") { currentFont = _DefaultFontFamily; }
            if (typeof currentFontSize === "undefined") { currentFontSize = _DefaultFontSize; }
            if (typeof currentXPosition === "undefined") { currentXPosition = 0; }
            if (typeof currentYPosition === "undefined") { currentYPosition = _DefaultFontSize; }
            if (typeof buffer === "undefined") { buffer = ""; }
            if (typeof consoleHistory === "undefined") { consoleHistory = new Array(); }
            if (typeof historyIndex === "undefined") { historyIndex = -1; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.consoleHistory = consoleHistory;
            this.historyIndex = historyIndex;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };

        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };

        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };

        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();

                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    //Add buffer to the console history
                    this.consoleHistory.push(this.buffer);

                    //Last index of the buffer
                    this.historyIndex = this.consoleHistory.length - 1;

                    // ... and reset our buffer.
                    this.buffer = "";
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);

                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };

        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "") {
                //                // Draw the text at the current X and Y coordinates.
                //                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                //                // Move the current X position.
                //                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                //                var newx = this.currentXPosition + offset;
                var i = 0;
                while (i != text.length) {
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text[i]);

                    var measurement = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text[i]);
                    var newLine = this.currentXPosition + measurement;

                    // -10 because the border radius is 5px.
                    if (newLine > (_Canvas.width - 10)) {
                        this.advanceLine();
                    } else {
                        this.currentXPosition = newLine;
                    }
                    i++;
                }
            }
        };

        /**
        * Renders the clock and the status on the top
        * of the page.
        */
        Console.prototype.renderDate = function () {
            //            setInterval(function(){
            //                document.getElementById("time").innerHTML = new Date().toLocaleTimeString();
            //            },1000);
            document.getElementById("time").innerHTML = "Hi, wanna edit me?";

            $(document).ready(function () {
                var clock;
                clock = $('.clock').FlipClock({
                    clockFace: 'TwelveHourClock'
                });
            });
        };

        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;

            /*
            * Font size measures from the baseline to the highest point in the font.
            * Font descent measures from the baseline to the lowest point in the font.
            * Font height margin is extra spacing between the lines.
            */
            this.currentYPosition += _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;

            // TODO: Handle scrolling. (Project 1)
            if (this.currentYPosition >= _Canvas.height - 10) {
                var currentCanvas = _DrawingContext.getImageData(0, this.currentFontSize, _Canvas.width, _Canvas.height);
                _DrawingContext.putImageData(currentCanvas, 0, 0);
                this.currentYPosition = _Canvas.height - this.currentFontSize;
            }
        };

        /**
        *
        * @param char, the character to delete
        *
        */
        Console.prototype.deleteLastChar = function (char) {
            var x = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
            var y = this.currentYPosition - _DefaultFontSize;
            this.buffer = this.buffer.substr(0, this.buffer.length - 1);
            _DrawingContext.clearRect(x, y, this.currentXPosition, this.currentYPosition + 10);
            this.currentXPosition = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
        };

        /**
        * Deletes the current line the user is at.
        */
        Console.prototype.deleteCurrentLine = function () {
            var x = this.currentXPosition;
            var y = this.currentYPosition - (_DefaultFontSize - 1);

            for (var i = 0; i < this.buffer.length; i++) {
                x -= _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.charAt(i));
            }
            _DrawingContext.clearRect(x, y, this.currentXPosition, this.currentYPosition);
            this.currentXPosition = x;
        };

        /**
        * Reset the current Buffer.
        */
        Console.prototype.deleteCurrentBuffer = function () {
            this.buffer = "";
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
