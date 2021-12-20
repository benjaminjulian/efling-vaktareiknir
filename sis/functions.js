function getWageBasis(bracket, step, rt, year) {
    if (year == 2021) {
        return Math.round(monthly2021[bracket]*(1+step*0.02)*(rt/100));
    } else if (year == 2022) {
        return Math.round(monthly2022[bracket]*(1+step*0.02)*(rt/100));
    }
}

function getShiftBonus(hrs, wageBracket, wageStep, shiftCount, ratio) {
    var basis = monthly2021[wageBracket] * (1 + wageStep * 0.02) * ratio / 100;
    var types = -1;
    
    if (hrs[0] >= 15) types++;
    if (hrs[1] >= 15) types++;
    if ((hrs[2] + hrs[4]) >= 15) types++;
    if (hrs[3] >= 15) types++;
    
    if (types >= 0)
        pct = bonusPcts[shiftCount][types]
    else pct = 0;
    
    return [pct, Math.round(pct*basis)];
}

function getSpecialPay(bracket, rt) {
    // return Math.round(Math.max(0,15000-1500*(Math.max(227,bracket)-227))*rt/100);
    if (bracket <= 124) return rt / 100 * 15000;
    
    switch (bracket) {
        case 125: return 13500 * rt / 100;
        case 126: return 12000 * rt / 100;
        case 127: return 9000 * rt / 100;
        case 128: return 7500 * rt / 100;
        case 129: return 4500 * rt / 100;
        case 130: return 2000 * rt / 100;
        default: return 0;
    }
}