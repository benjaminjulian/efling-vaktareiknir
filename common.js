const weekdays = ['sun', 'mán', 'þri', 'mið', 'fim', 'fös', 'lau'];
const storhatid = ["2022-1-1", "2022-4-15", "2022-4-17", "2021-5-23", "2021-6-17", "2021-8-2", "2021-12-25"];
const helgidagar = ["2022-4-14", "2022-4-18", "2022-4-21", "2021-4-22", "2021-5-1", "2021-5-13", "2021-5-24", "2021-12-26"];

var ratio = 100;
var ratioOld = 100;
var oldSetup = false;

function refreshRatioDisplay() {
    var oldContainer = document.getElementById('ratio-setter-container-old');
    var newContainer = document.getElementById('ratio-setter-container');
    
    if (document.getElementById('set-ratio-old').checked) oldContainer.style.display = '';
    else oldContainer.style.display = 'none';
    
    if (document.getElementById('set-ratio').checked) newContainer.style.display = '';
    else newContainer.style.display = 'none';
    
    refreshRatio();
}

function refreshRatio() {
    if (document.getElementById('set-ratio').checked) ratio = parseInt(document.getElementById('ratio-value').value);
    if (document.getElementById('set-ratio-old').checked) ratioOld = parseInt(document.getElementById('ratio-value-old').value);
    
    refresh();
}

function timeToHM(t) {
    /* deleted by popular request
    var hrs = Math.floor(t);
    var min = Math.round((t-hrs)*60);
    
    return hrs.toString() + ":" + min.toString().padStart(2,"0");
    */
    return (Math.round(t * 100) / 100).toLocaleString('is');
}

function fixTime(el) {
    el.value = el.value.replace('.', ':');
    el.value = el.value.replace(',', ':');
    if (!isNaN(el.value) && el.value !== "") {
        if (el.value.length >= 3)
            el.value = el.value.substring(0, el.value.length-2) + ":" + el.value.substr(-2);
        else
            el.value += ":00";
    }
}

function refresh() {
    processNewDays();
    processOldDays();
}

function populateOldWeeks() {
    oldSetup = true;
    populateNewWeeks('-old');
}

function populateNewWeeks(addon = '') {
    var tohide = document.querySelectorAll('.tohide' + addon);
    
    for (h = 0; h < tohide.length; h++) {
        tohide[h].style.display = 'none';
    }
    
    document.getElementById('result-container').style.display = '';
    if (addon === "-old") document.getElementById('comparison-container').style.display = '';
    
    var container = document.getElementById('week-list' + addon);
    var wageBracket = parseInt(document.getElementById('lfl').value);
    var wageStep = parseInt(document.getElementById('step').value);
    var weekCount = parseInt(document.getElementById('weeks' + addon).value);
    var startDate = new Date(document.getElementById('start' + addon).value);
    var firstDay = startDate.getDay();
    
    document.getElementById('lfl-print').innerHTML = wageBracket.toString();
    document.getElementById('step-print').innerHTML = document.getElementById('step').options[wageStep.toString()].text.toLowerCase();
    
    var tabIndex = 0;
    
    for (i = 0; i < weekCount; i++) {
        var weekBox = document.createElement('div');
        weekBox.id = "week" + i.toString();
        container.appendChild(weekBox);
        
        var weekName = document.createElement('p');
        weekName.innerHTML = "vika " + (i+1).toString();
        weekName.className = "weekname";
        weekBox.appendChild(weekName);
        
        for (j = 0; j < 7; j++) {
            dayBox = document.createElement('div');
            dayBox.id = "week" + i.toString() + "day" + j.toString() + addon;
            dayBox.className = 'daybox';
            if ((firstDay + j + 1) % 7 <= 1) dayBox.className += ' weekend';
            weekBox.appendChild(dayBox);
            
            daycaption = document.createElement('p');
            daycaption.className = "daycaption";
            daycaption.id = "week" + i.toString() + "day" + j.toString() + "caption" + addon;
            daycaption.innerHTML = weekdays[(firstDay + j) % 7];
            dayBox.appendChild(daycaption);
            
            startCont = document.createElement('div');
            startCont.className = "timecontainer";
            dayBox.appendChild(startCont);
            
            entryStart = document.createElement('input');
            entryStart.setAttribute('type', 'text');
            entryStart.className = "times";
            entryStart.id = "week" + i.toString() + "day" + j.toString() + "start" + addon;
            entryStart.name = "week" + i.toString() + "day" + j.toString() + "start" + addon;
            entryStart.setAttribute('placeholder', '00:00');
            entryStart.setAttribute('pattern', '[0-9]{1,2}:[0-9]{2}');
            entryStart.setAttribute('onfocusout', 'fixTime(this);refresh("' + addon + '");');
            entryStart.setAttribute('onkeypress', 'if (event.keyCode==13) {this.parentElement.nextElementSibling.firstChild.focus();}');
            //entryStart.setAttribute('tabindex', tabIndex++);
            startCont.append(entryStart);
            
            endCont = document.createElement('div');
            endCont.className = "timecontainer";
            dayBox.appendChild(endCont);
            
            entryEnd = document.createElement('input');
            entryEnd.setAttribute('type', 'text');
            entryEnd.className = "times";
            entryEnd.id = "week" + i.toString() + "day" + j.toString() + "end" + addon;
            entryEnd.name = "week" + i.toString() + "day" + j.toString() + "end" + addon;
            entryEnd.setAttribute('placeholder', '00:00');
            entryEnd.setAttribute('pattern', '[0-9]{1,2}:[0-9]{2}');
            entryEnd.setAttribute('onfocusout', 'fixTime(this);refresh("' + addon + '");');
            if (j === 6)
                entryEnd.setAttribute('onkeypress', 'if (event.keyCode==13) {this.parentElement.parentElement.parentElement.nextElementSibling.children[1].children[1].firstChild.focus();}');
            else
                entryEnd.setAttribute('onkeypress', 'if (event.keyCode==13) {this.parentElement.parentElement.nextElementSibling.children[1].firstChild.focus();}');
            //entryEnd.setAttribute('tabindex', tabIndex++);
            endCont.append(entryEnd);
            
            breaker = document.createElement('div');
            breaker.style.clear = 'both';
            dayBox.appendChild(breaker);
        }
        
        breaker = document.createElement('div');
        breaker.style.clear = 'both';
        weekBox.appendChild(breaker);
    }
    refresh();
}

function getPremiums(t1, t2, theDate, checkHolidays=false) {
    [night, day, evening, remainder] = getHrs(t1, t2);
    
    var dayID = (theDate.getMonth() + 1).toString() + "-" + theDate.getDate().toString();
    var dayIDlong = theDate.getYear().toString() + "-" + (theDate.getMonth() + 1).toString() + "-" + theDate.getDate().toString();
    
    var p_Daytime = 0;
    var p_33 = 0;
    var p_55 = 0;
    var p_65 = 0;
    var p_75 = 0;
    var p_90 = 0;
    var p_120 = 0;
    
    if (dayID == "12-24" && checkHolidays) {
        [night, day, evening, remainder] = getHrs(t1, t2, true);
        p_120 = evening;
        p_90 = day + night;
    } else if (dayID == "12-31" && checkHolidays) {
        [night, day, evening, remainder] = getHrs(t1, t2, true);
        p_120 = evening;
        p_90 = day + night;
    } else if (storhatid.indexOf(dayIDlong) !== -1 && checkHolidays) { // stórhátíð
        p_90 = night + day + evening;
    } else if ((theDate.getDay() + 1) % 7 < 2 || (checkHolidays && helgidagar.indexOf(dayIDlong) !== -1)) { // helgidagar
        p_75 = night;
        p_55 = day + evening;
    } else if (theDate.getDay() == 1) { // mán
        p_75 = night;
        p_Daytime = day;
        p_33 = evening;
    } else if ((theDate.getDay() + 2) % 7 > 3) { // þri-fim
        p_65 = night;
        p_Daytime = day;
        p_33 = evening;
    } else if (theDate.getDay() == 5) { // fös
        p_65 = night;
        p_Daytime = day;
        p_55 = evening;
    }
    
    if (remainder !== "") {
        var nextDay = new Date(theDate);
        nextDay.setDate(nextDay.getDate() + 1);
        [add_Daytime, add_33, add_55, add_65, add_75, add_90, add_120] = getPremiums("0:00", remainder, nextDay, checkHolidays);
        p_Daytime += add_Daytime;
        p_33 += add_33;
        p_55 += add_55;
        p_65 += add_65;
        p_75 += add_75;
        p_90 += add_90;
        p_120 += add_120;
    }
    
    return [p_Daytime, p_33, p_55, p_65, p_75, p_90, p_120];
}

function getPremiumsOld(t1, t2, theDate, checkHolidays=false) {
    [night, day, evening, remainder] = getHrsOld(t1, t2);
    var dayID = (theDate.getMonth() + 1).toString() + "-" + theDate.getDate().toString();
    var dayIDlong = theDate.getYear().toString() + "-" + (theDate.getMonth() + 1).toString() + "-" + theDate.getDate().toString();
    
    var p_Daytime = 0;
    var p_33 = 0;
    var p_55 = 0;
    var p_90 = 0;
    
    if (["12-31", "12-24"].indexOf(dayID) !== -1 && checkHolidays) {
        [night, day, evening, remainder] = getHrsOld(t1, t2, true);
        p_90 = evening;
        p_55 = night + day;
    } else if (storhatid.indexOf(dayIDlong) !== -1 && checkHolidays) { // stórhátíð
        p_90 = night + day + evening;
    } else if ((theDate.getDay() + 1) % 7 < 2 || (checkHolidays && helgidagar.indexOf(dayIDlong) !== -1)) { // helgidagar
        p_55 = night + day + evening;
    } else if ((theDate.getDay() + 2) % 7 > 2) { // mán-fim
        p_55 = night;
        p_Daytime += day;
        p_33 = evening;
    } else if (theDate.getDay() == 5) { // fös
        p_55 = night+evening;
        p_Daytime = day;
    }
    
    if (remainder !== "") {
        var nextDay = new Date(theDate);
        nextDay.setDate(nextDay.getDate() + 1);
        [add_Daytime, add_33, add_55, add_90] = getPremiumsOld("0:00", remainder, nextDay, checkHolidays);
        p_Daytime += add_Daytime;
        p_33 += add_33;
        p_55 += add_55;
        p_90 += add_90;
    }
    
    return [p_Daytime, p_33, p_55, p_90];
}

function processNewDays() {
    var weekCount = parseInt(document.getElementById('weeks').value);
    var startDate = new Date(document.getElementById('start').value);
    var firstDay = startDate.getDay();
    var wageBracket = parseInt(document.getElementById('lfl').value);
    var wageStep = parseInt(document.getElementById('step').value);
    var dt = new Date(startDate);
    
    var hrsDaytime = 0;
    var hrs33 = 0;
    var hrs55 = 0;
    var hrs65 = 0;
    var hrs75 = 0;
    var hrs90 = 0;
    var hrs120 = 0;

    var r_hrsDaytime = 0;
    var r_hrs33 = 0;
    var r_hrs55 = 0;
    var r_hrs65 = 0;
    var r_hrs75 = 0;
    var r_hrs90 = 0;
    var r_hrs120 = 0;
    var captionEl;
    
    var shiftCount = 0;
    var dayCount = 0;
    var calculatedWeeks = 4.33;
    
    var start = "";
    var end = "";
    
    var mode = document.getElementById('view').value;
    console.log("-------------- new days ---------------");
    // FOR RATIO
    for (var i = 0; i < weekCount; i++) {
        for (var j = 0; j < 7; j++) {
            start = document.getElementById('week' + i.toString() + 'day' + j.toString() + "start").value;
            end = document.getElementById('week' + i.toString() + 'day' + j.toString() + "end").value;
            captionEl = document.getElementById("week" + i.toString() + "day" + j.toString() + "caption");
            captionEl.innerHTML = weekdays[(firstDay + j) % 7];
            if (start !== "" && end !== "") {
                adds = getPremiums(start, end, dt);
                
                r_hrsDaytime += adds[0];
                r_hrs33 += adds[1];
                r_hrs55 += adds[2];
                r_hrs65 += adds[3];
                r_hrs75 += adds[4];
                r_hrs90 += adds[5];
                r_hrs120 += adds[6];
                
                shiftCount++;
            }
            
            dt.setDate(dt.getDate() + 1);
        }
    }
        
    scale = 4.33 / weekCount;
    shiftCount = Math.round(scale*shiftCount);
    
    if (document.getElementById('free-ratio').checked) ratio = Math.round(1000*(r_hrsDaytime + (r_hrs33 + r_hrs55) * 1.05 + (r_hrs65 + r_hrs75) * 1.2) / (weekCount * 36)) / 10;
    
    if (mode == "average") {
        hrsDaytime = r_hrsDaytime *= scale;
        hrs33 = r_hrs33 *= scale;
        hrs55 = r_hrs55 *= scale;
        hrs65 = r_hrs65 *= scale;
        hrs75 = r_hrs75 *= scale;
        hrs90 = r_hrs90 *= scale;
        hrs120 = r_hrs120 *= scale;
    } else {
        shiftCount = 0;
        var shiftRotaStart = parseInt(document.getElementById('start-date').value);
        dt = new Date(mode + "-" + shiftRotaStart.toString());
        if (shiftRotaStart > 1)
            dt.setMonth(dt.getMonth()-1);
        firstDay = dt.getDay();
        diff = (dt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        startingPoint = ((weekCount * 7 + diff) % (weekCount * 7) + weekCount * 7) % (weekCount * 7);
        var roller = 0;
        var maximum = new Date(dt.getFullYear(), dt.getMonth()+1, 0).getDate();
        
        while (roller < maximum) {
            day = dt.getDate()-1;
            leWeekday = dt.getDay();
            
            var w = Math.floor((startingPoint + roller)/7) % weekCount;
            var d = (startingPoint + roller) % 7;
            
            start = document.getElementById('week' + w.toString() + 'day' + d.toString() + "start").value;
            end = document.getElementById('week' + w.toString() + 'day' + d.toString() + "end").value;
            captionEl = document.getElementById("week" + w.toString() + "day" + d.toString() + "caption");
            
            if (captionEl.innerHTML.length > weekdays[leWeekday].length)
                captionEl.innerHTML += ", " + dt.getDate().toString() + "/" + (dt.getMonth()+1).toString();
            else
                captionEl.innerHTML = weekdays[leWeekday] + " " + dt.getDate().toString() + "/" + (dt.getMonth()+1).toString();
            
            if (start !== "" && end !== "") {
                adds = getPremiums(start, end, dt, true);
                /* DEBUGGING */
                console.log(dt);
                console.log(start + " - " + end);
                console.log(adds);
                //*/
                hrsDaytime += adds[0];
                hrs33 += adds[1];
                hrs55 += adds[2];
                hrs65 += adds[3];
                hrs75 += adds[4];
                hrs90 += adds[5];
                hrs120 += adds[6];
                
                shiftCount++;
            }
            dayCount++;
            roller++;
            dt.setDate(dt.getDate() + 1);
        }
        
        calculatedWeeks = dayCount / 7;
    }
    
    is2022 = mode.substring(0,4) === "2022";
    
    if (is2022) year = 2022;
    else year = 2021;
    
    period = year.toString() + "-new";

    hrs = [hrsDaytime, hrs33, hrs55, hrs65, hrs75, hrs90, hrs120];
    bonus = getShiftBonus(hrs, wageBracket, wageStep, shiftCount, ratio);
    special = getSpecialPay(wageBracket, ratio);
    printHours(wageBracket, wageStep, hrs, bonus, special, ratio, year);
    
    document.getElementById('rate-daytime').innerHTML = getWageBasis(wageBracket, wageStep, 100, year).toLocaleString('is');
    document.getElementById('rate-33').innerHTML = getWage(wageBracket, wageStep, 33.33, 1, 100, period).toLocaleString('is');
    document.getElementById('rate-55').innerHTML = getWage(wageBracket, wageStep, 55, 1, 100, period).toLocaleString('is');
    document.getElementById('rate-65').innerHTML = getWage(wageBracket, wageStep, 65, 1, 100, period).toLocaleString('is');
    document.getElementById('rate-75').innerHTML = getWage(wageBracket, wageStep, 75, 1, 100, period).toLocaleString('is');
    document.getElementById('rate-90').innerHTML = getWage(wageBracket, wageStep, 90, 1, 100, period).toLocaleString('is');
    document.getElementById('rate-120').innerHTML = getWage(wageBracket, wageStep, 120, 1, 100, period).toLocaleString('is');
    document.getElementById('rate-bonus').innerHTML = getWageBasis(wageBracket, wageStep, ratio, year).toLocaleString('is');
    document.getElementById('ratio-print').innerHTML = ratio.toString() + "%";
    document.getElementById('rate-special').innerHTML = getSpecialPay(wageBracket, 100).toLocaleString('is');
    document.getElementById('lfl-print').innerHTML = wageBracket.toString();
    document.getElementById('step-print').innerHTML = document.getElementById('step').options[wageStep.toString()].text.toLowerCase();
}

function processOldDays() {
    if (oldSetup) {
        var weekCount = parseInt(document.getElementById('weeks-old').value);
        var startDate = new Date(document.getElementById('start-old').value);
        var firstDay = startDate.getDay();
        var wageBracket = parseInt(document.getElementById('lfl').value);
        var wageStep = parseInt(document.getElementById('step').value);
        var dt = new Date(startDate);
        
        var hrsDaytime = 0;
        var hrs33 = 0;
        var hrs55 = 0;
        var hrs90 = 0;
    
        var r_hrsDaytime = 0;
        var r_hrs33 = 0;
        var r_hrs55 = 0;
        var r_hrs90 = 0;
        var calculatedWeeks = 4.33;
        var captionEl;
        
        var start = "";
        var end = "";
        
        var w, d;
        
        var mode = document.getElementById('view').value;
        var shiftCount = 0;
        var dayCount = 0;
        console.log('------------- old days ----------------');
        // FOR RATIO
        for (var i = 0; i < weekCount; i++) {
            for (var j = 0; j < 7; j++) {
                start = document.getElementById('week' + i.toString() + 'day' + j.toString() + "start-old").value;
                end = document.getElementById('week' + i.toString() + 'day' + j.toString() + "end-old").value;
                captionEl = document.getElementById("week" + i.toString() + "day" + j.toString() + "caption-old");
                captionEl.innerHTML = weekdays[(firstDay + j) % 7];
                
                if (start !== "" && end !== "") {
                    adds = getPremiumsOld(start, end, dt);
                    
                    r_hrsDaytime += adds[0];
                    r_hrs33 += adds[1];
                    r_hrs55 += adds[2];
                    r_hrs90 += adds[3];
                    
                    shiftCount++;
                }
                
                dt.setDate(dt.getDate() + 1);
            }
        }
            
        var scale = 4.33 / weekCount;
        
        if (document.getElementById('free-ratio-old').checked) ratioOld = Math.round(1000*(r_hrsDaytime + r_hrs33 + r_hrs55) / (weekCount * 40)) / 10;
        
        if (mode == "average") {
            hrsDaytime = r_hrsDaytime *= scale;
            hrs33 = r_hrs33 *= scale;
            hrs55 = r_hrs55 *= scale;
            hrs90 = r_hrs90 *= scale;
            shiftCount *= scale;
        } else {
            shiftCount = 0;
            var shiftRotaStart = parseInt(document.getElementById('start-date').value);
            dt = new Date(mode + "-" + shiftRotaStart.toString());
            if (shiftRotaStart > 1)
                dt.setMonth(dt.getMonth()-1);
            firstDay = dt.getDay();
            diff = (dt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            startingPoint = ((weekCount * 7 + diff) % (weekCount * 7) + weekCount * 7) % (weekCount * 7);
            var roller = 0;
            var maximum = new Date(dt.getFullYear(), dt.getMonth()+1, 0).getDate();
            
            while (roller < maximum) {
                day = dt.getDate()-1;
                leWeekday = dt.getDay();
                
                w = Math.floor((startingPoint + roller)/7) % weekCount;
                d = (startingPoint + roller) % 7;
                
                start = document.getElementById('week' + w.toString() + 'day' + d.toString() + "start-old").value;
                end = document.getElementById('week' + w.toString() + 'day' + d.toString() + "end-old").value;
                captionEl = document.getElementById("week" + w.toString() + "day" + d.toString() + "caption-old");
                if (captionEl.innerHTML.length > weekdays[leWeekday].length)
                    captionEl.innerHTML += ", " + dt.getDate().toString() + "/" + (dt.getMonth()+1).toString();
                else
                    captionEl.innerHTML = weekdays[leWeekday] + " " + dt.getDate().toString() + "/" + (dt.getMonth()+1).toString();
                
                if (start !== "" && end !== "") {
                    adds = getPremiumsOld(start, end, dt, true);
                    /* DEBUGGING */
                    console.log(dt);
                    console.log(start + " - " + end);
                    console.log(adds);
                    //*/
                    hrsDaytime += adds[0];
                    hrs33 += adds[1];
                    hrs55 += adds[2];
                    hrs90 += adds[3];
                    
                    shiftCount++;
                }
                dayCount++;
                roller++;
                dt.setDate(dt.getDate() + 1);
            }
            
            calculatedWeeks = dayCount / 7;
        }
    
        var is2022 = mode.substring(0,4) === "2022";
        
        if (is2022) year = 2022;
        else year = 2021;
        
        var period = year.toString() + "-old";
    
        var hrs = [hrsDaytime, hrs33, hrs55,hrs90];
        var special = getSpecialPay(wageBracket, ratioOld);
        printHoursOld(wageBracket, wageStep, hrs, special, year, ratioOld, shiftCount);
        
        document.getElementById('rate-daytime-old').innerHTML = getWageBasis(wageBracket, wageStep, 100, year).toLocaleString('is');
        document.getElementById('rate-coffee-old').innerHTML = getCoffeeBreaks(wageBracket, wageStep, year).toLocaleString('is');
        document.getElementById('rate-33-old').innerHTML = getWage(wageBracket, wageStep, 33.33, 1, 100, period).toLocaleString('is');
        document.getElementById('rate-55-old').innerHTML = getWage(wageBracket, wageStep, 55, 1, 100, period).toLocaleString('is');
        document.getElementById('rate-90-old').innerHTML = getWage(wageBracket, wageStep, 90, 1, 100, period).toLocaleString('is');
        document.getElementById('ratio-print-old').innerHTML = ratioOld.toString() + "%";
        document.getElementById('rate-special-old').innerHTML = getSpecialPay(wageBracket, 100).toLocaleString('is');
        document.getElementById('lfl-print').innerHTML = wageBracket.toString();
        document.getElementById('step-print').innerHTML = document.getElementById('step').options[wageStep.toString()].text.toLowerCase();
        comparison();
    }
}

function displayOld() {
    document.getElementById('calc-old').style.display = '';
    document.getElementById('old').style.display = '';
    document.getElementById('old-caption').style.display = 'none';
}

function getWage(bracket, step, pct, hrs, rt = 100, period = "2021-new") {
    var year = parseInt(period.substring(0,4));
    var old = period.substring(5) === "old";
    
    var basis = getWageBasis(bracket, step, rt, year);
    var calcBasis = getWageBasis(bracket, step, 100, year);
    
    if (pct == 0) return basis;
    else {
        if (old) return Math.round(hrs * calcBasis * 0.00615 * pct / 100);
        else return Math.round(hrs * calcBasis * 0.00632 * pct / 100);
    }
}

function getHrs(t1, t2, christmasOrNewYearsEve = false) {
    [hr1, min1] = t1.split(':').map(Number);
    [hr2, min2] = t2.split(':').map(Number);
    var remainder = "";
    
    if (christmasOrNewYearsEve) eveningLimit = 16; else eveningLimit = 17;
    
    if (hr1 == 24) hr1 = 0;
    if (hr2 < hr1) {
        remainder = hr2.toString() + ":" + min2.toString();
        hr2 = 24;
        min2 = 0;
    }
    
    
    time1 = hr1 + min1/60;
    time2 = hr2 + min2/60;
    
    night = 0;
    day = 0;
    evening = 0;
    
    if (time1 < 8) {
        if (time2 < 8) {
            night = time2 - time1;
        } else {
            night = 8 - time1;
            time1 = 8;
        }
    }
    
    if (time1 < eveningLimit && time2 > 8) {
        if (time2 < eveningLimit) {
            day = time2 - time1;
        } else {
            day = eveningLimit - time1;
            time1 = eveningLimit;
        }
    }
    
    if (time1 < 24 && time2 > eveningLimit) {
        if (time2 < 24) {
            evening = time2 - time1;
        } else {
            evening = 24 - time1;
            time1 = 24;
        }
    }
    
    if (time2 > 24) {
        night += time2 - time1;
    }
    
    return [night, day, evening, remainder];
}

function getHrsOld(t1, t2, christmasOrNewYearsEve = false) {
    [hr1, min1] = t1.split(':').map(Number);
    [hr2, min2] = t2.split(':').map(Number);
    var remainder = "";
    
    if (christmasOrNewYearsEve) eveningLimit = 12; else eveningLimit = 17;
    
    if (hr1 == 24) hr1 = 0;
    if (hr2 < hr1) {
        remainder = hr2.toString() + ":" + min2.toString();
        hr2 = 24;
        min2 = 0;
    }
    
    var time1 = hr1 + min1/60;
    var time2 = hr2 + min2/60;
    
    var night = 0;
    var day = 0;
    var evening = 0;
    
    if (time1 < 8) {
        if (time2 < 8) {
            night = time2 - time1;
        } else {
            night = 8 - time1;
            time1 = 8;
        }
    }
    
    if (time1 < eveningLimit && time2 > 8) {
        if (time2 < eveningLimit) {
            day = time2 - time1;
        } else {
            day = eveningLimit - time1;
            time1 = eveningLimit;
        }
    }
    
    if (time1 < 24 && time2 > eveningLimit) {
        if (time2 < 24) {
            evening = time2 - time1;
        } else {
            evening = 24 - time1;
            time1 = 24;
        }
    }
    
    if (time2 > 24) {
        night += time2 - time1;
    }
    
    return [night, day, evening, remainder];
}

function getMonthlySum(m) {
    // NEW
    var pcts = [0,33.33,55,65,75,90,120];
    var period = m.substring(0, 4) + "-new";
    var shiftCount = 0;
    var weekCount = parseInt(document.getElementById('weeks').value);
    var startDate = new Date(document.getElementById('start').value);
    var wageBracket = parseInt(document.getElementById('lfl').value);
    var wageStep = parseInt(document.getElementById('step').value);
    var shiftRotaStart = parseInt(document.getElementById('start-date').value);
    var dt = new Date(m + "-" + shiftRotaStart.toString());
    if (shiftRotaStart > 1)
        dt.setMonth(dt.getMonth()-1);
    var firstDay = dt.getDay();
    var diff = (dt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    var startingPoint = ((weekCount * 7 + diff) % (weekCount * 7) + weekCount * 7) % (weekCount * 7);
    var w, d, start, end, captionEl, hrs;
    var hrsDaytime = 0;
    var hrs33 = 0;
    var hrs55 = 0;
    var hrs65 = 0;
    var hrs75 = 0;
    var hrs90 = 0;
    var hrs120 = 0;
    var r_hrsDaytime = 0;
    var r_hrs33 = 0;
    var r_hrs55 = 0;
    var r_hrs65 = 0;
    var r_hrs75 = 0;
    var r_hrs90 = 0;
    var r_hrs120 = 0;
    var dayCount = 0;
    var roller = 0;
    var maximum = new Date(dt.getFullYear(), dt.getMonth()+1, 0).getDate();
    
    while (roller < maximum) {
        day = dt.getDate()-1;
        
        var w = Math.floor((startingPoint + roller)/7) % weekCount;
        var d = (startingPoint + roller) % 7;
        
        start = document.getElementById('week' + w.toString() + 'day' + d.toString() + "start").value;
        end = document.getElementById('week' + w.toString() + 'day' + d.toString() + "end").value;
        
        if (start !== "" && end !== "") {
            adds = getPremiums(start, end, dt, true);
            hrsDaytime += adds[0];
            hrs33 += adds[1];
            hrs55 += adds[2];
            hrs65 += adds[3];
            hrs75 += adds[4];
            hrs90 += adds[5];
            hrs120 += adds[6];
            
            shiftCount++;
        }
        dayCount++;
        roller++;
        dt.setDate(dt.getDate() + 1);
    }
    
    calculatedWeeks = dayCount / 7;
    
    hrs = [hrsDaytime, hrs33, hrs55, hrs65, hrs75, hrs90, hrs120];
    var bonus = getShiftBonus(hrs, wageBracket, wageStep, shiftCount, ratio);
    var special = getSpecialPay(wageBracket, ratio);
    
    return hrs.reduce((r,c,i) => r + getWage(wageBracket, wageStep, pcts[i], c, ratio, period), 0) + bonus[1] + special;
}

function getMonthlySumOld(m) {
    // NEW
    var pcts = [0,33.33,55,90];
    var period = m.substring(0, 4) + "-old";
    var shiftCount = 0;
    var weekCount = parseInt(document.getElementById('weeks-old').value);
    var startDate = new Date(document.getElementById('start-old').value);
    var wageBracket = parseInt(document.getElementById('lfl').value);
    var wageStep = parseInt(document.getElementById('step').value);
    var shiftRotaStart = parseInt(document.getElementById('start-date').value);
    var dt = new Date(m + "-" + shiftRotaStart.toString());
    if (shiftRotaStart > 1)
        dt.setMonth(dt.getMonth()-1);
    var firstDay = dt.getDay();
    var month = dt.getMonth();
    var diff = (dt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    var startingPoint = ((weekCount * 7 + diff) % (weekCount * 7) + weekCount * 7) % (weekCount * 7);
    var w, d, start, end, hrs;
    var hrsDaytime = 0;
    var hrs33 = 0;
    var hrs55 = 0;
    var hrs90 = 0;
    var r_hrsDaytime = 0;
    var r_hrs33 = 0;
    var r_hrs55 = 0;
    var r_hrs90 = 0;
    var dayCount = 0;
    var roller = 0;
    var maximum = new Date(dt.getFullYear(), dt.getMonth()+1, 0).getDate();
    
    while (roller < maximum) {
        day = dt.getDate()-1;
        
        w = Math.floor((startingPoint + roller)/7) % weekCount;
        d = (startingPoint + roller) % 7;
        
        start = document.getElementById('week' + w.toString() + 'day' + d.toString() + "start-old").value;
        end = document.getElementById('week' + w.toString() + 'day' + d.toString() + "end-old").value;
        
        if (start !== "" && end !== "") {
            adds = getPremiumsOld(start, end, dt, true);
            hrsDaytime += adds[0];
            hrs33 += adds[1];
            hrs55 += adds[2];
            hrs90 += adds[3];
            
            shiftCount++;
        }
        dayCount++;
        roller++;
        dt.setDate(dt.getDate() + 1);
    }
    
    calculatedWeeks = dayCount / 7;
    
    var hrs = [hrsDaytime, hrs33, hrs55,hrs90];
    var special = getSpecialPay(wageBracket, ratioOld);
    
    return hrs.reduce((r,c,i) => r + getWage(wageBracket, wageStep, pcts[i], c, ratioOld, period), 0) + special + getCoffeeBreaks(wageBracket, wageStep, year, shiftCount);
}

function printHours(bracket, step, hrs, bonus, special, ratio, year) { // assumes monthly basis!
    pcts = [0,33.33,55,65,75,90,120];
    period = year.toString() + "-new";
    document.getElementById('pct-special').innerHTML = ratio.toLocaleString('is') + "%";
    document.getElementById('hrs-daytime').innerHTML = ratio.toLocaleString('is') + "%";
    document.getElementById('hrs-33').innerHTML = timeToHM(hrs[1]);
    document.getElementById('hrs-55').innerHTML = timeToHM(hrs[2]);
    document.getElementById('hrs-65').innerHTML = timeToHM(hrs[3]);
    document.getElementById('hrs-75').innerHTML = timeToHM(hrs[4]);
    document.getElementById('hrs-90').innerHTML = timeToHM(hrs[5]);
    document.getElementById('hrs-120').innerHTML = timeToHM(hrs[6]);
    document.getElementById('pct-bonus').innerHTML = (100*bonus[0]).toLocaleString('is') + "%";
    //document.getElementById('hrs-all').innerHTML = timeToHM(hrs.reduce((r,c) => r + c, 0));
    
    document.getElementById('kr-special').innerHTML = special.toLocaleString('is');
    document.getElementById('kr-daytime').innerHTML = getWageBasis(bracket, step, ratio, year).toLocaleString('is');
    document.getElementById('kr-33').innerHTML = getWage(bracket, step, 33.33, hrs[1], 100, period).toLocaleString('is');
    document.getElementById('kr-55').innerHTML = getWage(bracket, step, 55, hrs[2], 100, period).toLocaleString('is');
    document.getElementById('kr-65').innerHTML = getWage(bracket, step, 65, hrs[3], 100, period).toLocaleString('is');
    document.getElementById('kr-75').innerHTML = getWage(bracket, step, 75, hrs[4], 100, period).toLocaleString('is');
    document.getElementById('kr-90').innerHTML = getWage(bracket, step, 90, hrs[5], 100, period).toLocaleString('is');
    document.getElementById('kr-120').innerHTML = getWage(bracket, step, 120, hrs[6], 100, period).toLocaleString('is');
    document.getElementById('kr-bonus').innerHTML = bonus[1].toLocaleString('is');
    document.getElementById('kr-all').innerHTML = (hrs.reduce((r,c,i) => r + getWage(bracket, step, pcts[i], c, ratio, period), 0) + bonus[1] + special).toLocaleString('is');
}

function printHoursOld(bracket, step, hrs, special, year, ratio, shiftCount) { // assumes monthly basis!
    pcts = [0,33.33,55,90];
    period = year.toString() + "-old";
    document.getElementById('pct-special-old').innerHTML = ratioOld.toLocaleString('is') + "%";
    document.getElementById('hrs-daytime-old').innerHTML = ratioOld.toLocaleString('is') + "%";
    document.getElementById('hrs-coffee-old').innerHTML = timeToHM(shiftCount*0.42);
    document.getElementById('hrs-33-old').innerHTML = timeToHM(hrs[1]);
    document.getElementById('hrs-55-old').innerHTML = timeToHM(hrs[2]);
    document.getElementById('hrs-90-old').innerHTML = timeToHM(hrs[3]);
    //document.getElementById('hrs-all-old').innerHTML = timeToHM(hrs.reduce((r,c) => r + c, 0));
    
    document.getElementById('kr-special-old').innerHTML = special.toLocaleString('is');
    document.getElementById('kr-daytime-old').innerHTML = getWageBasis(bracket, step, ratio, year).toLocaleString('is');
    document.getElementById('kr-coffee-old').innerHTML = getCoffeeBreaks(bracket, step, year, shiftCount).toLocaleString('is');
    document.getElementById('kr-33-old').innerHTML = getWage(bracket, step, 33.33, hrs[1], 100, period).toLocaleString('is');
    document.getElementById('kr-55-old').innerHTML = getWage(bracket, step, 55, hrs[2], 100, period).toLocaleString('is');
    document.getElementById('kr-90-old').innerHTML = getWage(bracket, step, 90, hrs[3], 100, period).toLocaleString('is');
    document.getElementById('kr-all-old').innerHTML = (hrs.reduce((r,c,i) => r + getWage(bracket, step, pcts[i], c, ratio, period), 0) + special + getCoffeeBreaks(bracket, step, year, shiftCount)).toLocaleString('is');
}

function getCoffeeBreaks(bracket, step, year, shiftCount = 1/0.42) {
    return Math.round(getWage(bracket, step, 0, 1, 100, year.toString() + "-old")*0.010385*shiftCount*0.42);
}

function comparison() {
    var months = ["2021-05", "2021-06", "2021-07", "2021-08", "2021-09", "2021-10", "2021-11", "2021-12", "2022-01", "2022-02", "2022-03", "2022-04"];
    var current = document.getElementById('view').value;
    var sumNew = 0;
    var sumOld = 0;
    
    if (current == "average") {
        document.getElementById('diff-month').innerHTML = "-";
        document.getElementById('diff-month-label').innerHTML = "-";
    } else {
        var monNew = getMonthlySum(current);
        var monOld = getMonthlySumOld(current);
        document.getElementById('diff-month').innerHTML = (monNew - monOld).toLocaleString('is');
        var selector = document.getElementById('view');
        document.getElementById('diff-month-label').innerHTML = selector.options[selector.selectedIndex].text;
    }
    
    months.forEach(function(m) {
        sumNew += getMonthlySum(m);
        sumOld += getMonthlySumOld(m);
    });
    
    document.getElementById('diff-year').innerHTML = (sumNew - sumOld).toLocaleString('is');
}