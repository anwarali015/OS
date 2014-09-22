///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57) && (! isShifted)) ||   // digits
                        (keyCode == 32)                     ||                    // space
                        (keyCode == 13)) {                                        // enter
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 186 && keyCode <= 192) ||
                (keyCode >= 219 && keyCode <= 222)){        //Punctuation characters
                _KernelInputQueue.enqueue(this.getPunctuationCharacter(keyCode, isShifted));
            } else if(keyCode == 8){
               var lastChar = _Console.buffer;
                lastChar = lastChar.substr(lastChar.length-1,lastChar.length);
                if(lastChar.length == 0){
                    return;
                }else {
                    _Console.deleteLastChar(lastChar);
                }
            } else if ((keyCode >= 48) && (keyCode <= 57) && (isShifted)){
                _KernelInputQueue.enqueue(this.specialNumber(keyCode, isShifted));
            } else if (keyCode == 38 || keyCode == 40){ //UP or DOWN key


                 _Console.deleteCurrentLine();
                 _Console.deleteCurrentBuffer();

                if(keyCode == 38) { //UP Arrow Key

                    if (_Console.historyIndex < 0) {
                        _Console.historyIndex = _Console.consoleHistory.length - 1;
                    }

                    if (_Console.historyIndex >= _Console.consoleHistory.length) {
                        _Console.historyIndex = 0;
                    }

                    if (_Console.consoleHistory[_Console.historyIndex]) {

                        this.pullHistory(_Console.consoleHistory[_Console.historyIndex]);
                    }
                }else{

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

            } else if(keyCode == 9){    //Tab key

                _Console.advanceLine();
                var buffer = _Console.buffer;

                var  s = new Shell;

                _Console.putText("s " + s.commandList.length);
                for(var i=0; i<buffer.length;i++){
                    for(var j=0; j<s.commandList.length;j++){
                        if(buffer.substring(0,2) == s.commandList[i].substring(0,2)){
                            _Console.putText("Command list " + s.commandList[i]);
                            return;
                        }
                    }
                }
            }
        }

        /**
         * Gets the punctuation character of the asci
         * @param asci
         * @param isShifted
         * @returns {string}
         */
        public getPunctuationCharacter(asci,isShifted){

            var ascii = [186,187,188,189,190,191,192,219,220,221,222];
            var notShifted = [';','=',',','-','.','/','`','[','\\',']','\''];
            var shifted = [':','+','<','_','>','?','~','{','|','}','\"'];

            var letter = '';

            if (isShifted) {

                for(var i = 0; i < ascii.length; i++){
                    if(asci == ascii[i]){
                        letter = shifted[i];
                    }
                }
            }else {
                for (var i = 0; i < ascii.length; i++) {
                    if (asci == ascii[i]) {
                        letter = notShifted[i];
                    }
                }
            }
            return letter;
        }

        /**
         * Gets the associated ascii character.
         *
         * @param asci
         * @param isShifted
         * @returns {string}
         */
        public specialNumber(asci,isShifted){

            var ascii = [48,49,50,51,52,53,54,55,56,57];
            var char = [')','!','@','#','$','%','^','&','*','('];

            var letter = String.fromCharCode(asci);

            if(isShifted) {
                
                for (var i = 0; i < ascii.length; i++) {
                    if (asci == ascii[i]) {
                        letter = char[i];
                    }
                }
            }
            return letter;
        }

        /**
         * Pulls the history out of the current buffer.
         * @param buffer, the buffer to pull history from.
         */
        public pullHistory(buffer){

            for(var i=0; i<buffer.length;i++){
                _KernelInputQueue.enqueue(buffer.charAt(i));
            }
        }

    }
}
