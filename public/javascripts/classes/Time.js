class Time {

    static diffBetweenTimes(timeString1, timeString2) {

        let splitTime1 = timeString1.split(':');
        let splitTime2 = timeString2.split(':');

        let hrsMilli1 = Number(splitTime1[0]) * 3.6e+6;
        let minMilli1 = Number(splitTime1[1]) * 60000;

        let hrsMilli2 = Number(splitTime2[0]) * 3.6e+6;
        let minMilli2 = Number(splitTime2[1]) * 60000;

        let millis1 = hrsMilli1 + minMilli1;
        let millis2 = hrsMilli2 + minMilli2;

        let millisDiff = millis2 - millis1;

        return millisDiff;
    }

    static convertToTimeString(millis) {

        let begin = '';
        if(millis < 0){
            begin = '-';
            millis = millis*-1;
        }
        
        let minutos = Math.ceil(millis / 60000);
        let horas = Math.floor(minutos / 60);
        minutos = minutos - horas * 60;

        return `${begin}${('0'+horas).slice(-2)}:${('0'+minutos).slice(-2)}`;

    }

    static itsTime(timeString) {

        if (/^\d{1,2}:\d{2}$/.test(timeString))
            return true


        return false;

    }

}