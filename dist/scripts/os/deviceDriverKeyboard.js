///<reference path="deviceDriver.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
DeviceDriverKeyboard.ts
Requires deviceDriver.ts
The Kernel Keyboard Device Driver.
---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            _super.call(this, this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };

        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";

            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);

                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }

                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57) && (!isShifted)) || (keyCode == 32) || (keyCode == 13)) {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 186 && keyCode <= 192) || (keyCode >= 219 && keyCode <= 222)) {
                _KernelInputQueue.enqueue(this.getPunctuationCharacter(keyCode, isShifted));
            } else if (keyCode == 8) {
                var lastChar = _Console.buffer;
                lastChar = lastChar.substr(lastChar.length - 1, lastChar.length);
                if (lastChar.length == 0) {
                    return;
                } else {
                    _Console.deleteLastChar(lastChar);
                }
            } else if ((keyCode >= 48) && (keyCode <= 57) && (isShifted)) {
                _KernelInputQueue.enqueue(this.specialNumber(keyCode, isShifted));
            } else if (keyCode == 38 || keyCode == 40) {
                _Console.deleteCurrentLine();
                _Console.deleteCurrentBuffer();

                if (keyCode == 38) {
                    if (_Console.historyIndex < 0) {
                        _Console.historyIndex = _Console.consoleHistory.length - 1;
                    }

                    if (_Console.historyIndex >= _Console.consoleHistory.length) {
                        _Console.historyIndex = 0;
                    }

                    if (_Console.consoleHistory[_Console.historyIndex]) {
                        this.pullHistory(_Console.consoleHistory[_Console.historyIndex]);
                    }
                } else {
                    _Console.historyIndex--;

                    if (_Console.historyIndex >= _Console.consoleHistory.length) {
                        _Console.historyIndex = 0;
                    }

                    if (_Console.historyIndex < 0) {
                        _Console.historyIndex = _Console.consoleHistory.length - 1;
                    }

                    if (_Console.consoleHistory[_Console.historyIndex]) {
                        this.pullHistory(_Console.consoleHistory[_Console.historyIndex]);
                    }
                }
                _Console.historyIndex--;
            } else if (keyCode == 9) {
                _Console.advanceLine();
                var buffer = _Console.buffer;

                var s = new TSOS.Shell;

                _Console.putText("s " + s.commandList.length);
                for (var i = 0; i < buffer.length; i++) {
                    for (var j = 0; j < s.commandList.length; j++) {
                        if (buffer.substring(0, 2) == s.commandList[i].substring(0, 2)) {
                            _Console.putText("Command list " + s.commandList[i]);
                            return;
                        }
                    }
                }
            }
        };

        /**
        * Gets the punctuation character of the asci
        * @param asci
        * @param isShifted
        * @returns {string}
        */
        DeviceDriverKeyboard.prototype.getPunctuationCharacter = function (asci, isShifted) {
            var ascii = [186, 187, 188, 189, 190, 191, 192, 219, 220, 221, 222];
            var notShifted = [';', '=', ',', '-', '.', '/', '`', '[', '\\', ']', '\''];
            var shifted = [':', '+', '<', '_', '>', '?', '~', '{', '|', '}', '\"'];

            var letter = '';

            if (isShifted) {
                for (var i = 0; i < ascii.length; i++) {
                    if (asci == ascii[i]) {
                        letter = shifted[i];
                    }
                }
            } else {
                for (var i = 0; i < ascii.length; i++) {
                    if (asci == ascii[i]) {
                        letter = notShifted[i];
                    }
                }
            }
            return letter;
        };

        /**
        * Gets the associated ascii character.
        *
        * @param asci
        * @param isShifted
        * @returns {string}
        */
        DeviceDriverKeyboard.prototype.specialNumber = function (asci, isShifted) {
            var ascii = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
            var char = [')', '!', '@', '#', '$', '%', '^', '&', '*', '('];

            var letter = String.fromCharCode(asci);

            if (isShifted) {
                for (var i = 0; i < ascii.length; i++) {
                    if (asci == ascii[i]) {
                        letter = char[i];
                    }
                }
            }
            return letter;
        };

        /**
        * Pulls the history out of the current buffer.
        * @param buffer, the buffer to pull history from.
        */
        DeviceDriverKeyboard.prototype.pullHistory = function (buffer) {
            for (var i = 0; i < buffer.length; i++) {
                _KernelInputQueue.enqueue(buffer.charAt(i));
            }
        };
        return DeviceDriverKeyboard;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
