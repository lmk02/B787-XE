class B787_10_Com extends BaseAirliners {
    constructor() {
        super(...arguments);
        this.allPages = new Array();
        this.currentPageId = 0;
    }
    get templateID() { return "B787_10_Com"; }
    get instrumentAlias() { return "AS01B_Com"; }
    connectedCallback() {
        super.connectedCallback();
        this.allPages.push(new B787_10_Com_Menu(this));
        this.allPages.push(new B787_10_Com_VHF(this));
        this.allPages.push(new B787_10_Com_HF(this));
        this.allPages.push(new B787_10_Com_SAT(this));
        this.allPages.push(new B787_10_Com_CAB(this));
        this.allPages.push(new B787_10_Com_GPWS(this));
        this.allPages.push(new B787_10_Com_WXR(this));
        this.allPages.push(new B787_10_Com_XPDR(this));
        this.allPages.push(new B787_10_Com_NAV(this));
        this.showPage(0);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        for (let i = 0; i < this.allPages.length; i++) {
            if (this.allPages[i].visible)
                this.allPages[i].onUpdate(this.deltaTime);
        }
    }
    onEvent(_event) {
        switch (_event) {
            case "menu":
                this.showPage(0);
                break;
            case "vhf":
                this.showPage(1);
                break;
            case "hf":
                this.showPage(2);
                break;
            case "sat":
                this.showPage(3);
                break;
            case "cab":
                this.showPage(4);
                break;
            case "gpws":
                this.showPage(5);
                break;
            case "wxr":
                this.showPage(6);
                break;
            case "xpdr":
                this.showPage(7);
                break;
            case "nav":
                this.showPage(8);
                break;
            default:
                this.allPages[this.currentPageId].onEvent(_event);
                break;
        }
    }
    showPage(_id) {
        this.currentPageId = _id;
        for (let i = 0; i < this.allPages.length; i++) {
            if (i == this.currentPageId)
                this.allPages[i].show();
            else
                this.allPages[i].hide();
        }
    }
}
class B787_10_Com_Page {
    constructor(_com, _elementName) {
        this.inputMax = 20;
        this.inputClr = "CLEAR";
        this.inputInvalid = "INVALID ENTRY";
        this.visible = false;
        this.com = _com;
        this.input = this.com.querySelector(".Input");
        this.setRoot(_elementName);
    }
    setRoot(_elementName) {
        if (this.root)
            this.root.setAttribute("visibility", "hidden");
        this.root = this.com.querySelector(_elementName);
        if (this.root) {
            this.l1 = this.root.querySelector(".L1");
            this.l2 = this.root.querySelector(".L2");
            this.l3 = this.root.querySelector(".L3");
            this.l4 = this.root.querySelector(".L4");
            this.r1 = this.root.querySelector(".R1");
            this.r2 = this.root.querySelector(".R2");
            this.r3 = this.root.querySelector(".R3");
            this.r4 = this.root.querySelector(".R4");
            this.root.setAttribute("visibility", (this.visible) ? "visible" : "hidden");
        }
    }
    show() {
        this.root.setAttribute("visibility", "visible");
        this.visible = true;
    }
    hide() {
        this.root.setAttribute("visibility", "hidden");
        this.visible = false;
    }
    onUpdate(_deltaTime) {
    }
    onEvent(_event) {
        if (_event.startsWith("BTN_")) {
            let key = _event.replace("BTN_", "");
            if (this.input.textContent == this.inputClr || this.input.textContent == this.inputInvalid)
                this.input.textContent = key;
            else if (this.input.textContent.length < this.inputMax)
                this.input.textContent += key;
            return;
        }
        switch (_event) {
            case "clr":
                if (this.input.textContent != "")
                    this.input.textContent = "";
                else
                    this.input.textContent = this.inputClr;
                break;
            case "star":
                if (this.input.textContent.length < this.inputMax)
                    this.input.textContent += ".";
                break;
        }
    }
    setValue(_elem, _val) {
        if (_elem == this.l1 || _elem == this.l2 || _elem == this.l3 || _elem == this.l4)
            _elem.textContent = "<" + _val;
        else if (_elem == this.r1 || _elem == this.r2 || _elem == this.r3 || _elem == this.r4)
            _elem.textContent = _val + ">";
    }
    getValue(_elem) {
        if (_elem == this.l1 || _elem == this.l2 || _elem == this.l3 || _elem == this.l4)
            return _elem.textContent.substring(1);
        else if (_elem == this.r1 || _elem == this.r2 || _elem == this.r3 || _elem == this.r4)
            return _elem.textContent.substring(0, _elem.textContent.length - 1);
        return "";
    }
    setHTML(_elem, _val) {
        if (_elem == this.l1 || _elem == this.l2 || _elem == this.l3 || _elem == this.l4)
            _elem.innerHTML = "<" + _val;
        else if (_elem == this.r1 || _elem == this.r2 || _elem == this.r3 || _elem == this.r4)
            _elem.innerHTML = _val + ">";
    }
}
class B787_10_Com_VHF extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#VHF");
        this._activeLine = -1;
        this.noFreq = "[.]";
        this.l1Title = this.root.querySelector(".L1_Title");
        this.l2Title = this.root.querySelector(".L2_Title");
        this.l3Title = this.root.querySelector(".L3_Title");
        this.r1Title = this.root.querySelector(".R1_Title");
        this.r2Title = this.root.querySelector(".R2_Title");
        this.r3Title = this.root.querySelector(".R3_Title");
        this.arrows = this.root.querySelector("#Arrows");
    }
    show() {
        super.show();
        this.setFreq(this.l1, this.com.radioNav.getVHF1ActiveFrequency(this.com.instrumentIndex));
        this.setFreq(this.r1, this.com.radioNav.getVHF1StandbyFrequency(this.com.instrumentIndex));
        this.setFreq(this.l2, this.com.radioNav.getVHF2ActiveFrequency(this.com.instrumentIndex));
        this.setFreq(this.r2, this.com.radioNav.getVHF2StandbyFrequency(this.com.instrumentIndex));
        this.setFreq(this.l3, this.com.radioNav.getVHF3ActiveFrequency(this.com.instrumentIndex));
        this.setFreq(this.r3, this.com.radioNav.getVHF3StandbyFrequency(this.com.instrumentIndex));
        this.activeLine = 0;
    }
    get activeLine() { return this._activeLine; }
    set activeLine(_id) {
        if (this._activeLine != _id) {
            this._activeLine = _id;
            SimVar.SetSimVarValue("L:VHF_ACTIVE_INDEX:" + this.com.instrumentIndex, "number", _id);
            switch (this._activeLine) {
                case 0:
                    this.l1Title.textContent = "ACTIVE";
                    this.l2Title.textContent = "";
                    this.l3Title.textContent = "";
                    this.r1Title.textContent = "STBY";
                    this.r2Title.textContent = "";
                    this.r3Title.textContent = "";
                    this.arrows.style.transform = "translate(250px, 85px)";
                    break;
                case 1:
                    this.l1Title.textContent = "";
                    this.l2Title.textContent = "ACTIVE";
                    this.l3Title.textContent = "";
                    this.r1Title.textContent = "";
                    this.r2Title.textContent = "STBY";
                    this.r3Title.textContent = "";
                    this.arrows.style.transform = "translate(250px, 165px)";
                    break;
                case 2:
                    this.l1Title.textContent = "";
                    this.l2Title.textContent = "";
                    this.l3Title.textContent = "ACTIVE";
                    this.r1Title.textContent = "";
                    this.r2Title.textContent = "";
                    this.r3Title.textContent = "STBY";
                    this.arrows.style.transform = "translate(250px, 240px)";
                    break;
            }
        }
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                if (this.activeLine != 0) {
                    this.activeLine = 0;
                }
                else {
                    this.writeFreq(this.l1);
                    this.swap();
                }
                break;
            case "R1":
                this.writeFreq(this.r1);
                break;
            case "L2":
                if (this.activeLine != 1) {
                    this.activeLine = 1;
                }
                else {
                    this.writeFreq(this.l2);
                    this.swap();
                }
                break;
            case "R2":
                this.writeFreq(this.r2);
                break;
            case "L3":
                if (this.activeLine != 2) {
                    this.activeLine = 2;
                }
                else {
                    this.writeFreq(this.l3);
                    this.swap();
                }
                break;
            case "R3":
                this.writeFreq(this.r3);
                break;
            case "stbyup":
                this.stbyInc();
                break;
            case "stbydn":
                this.stbyDec();
                break;
            case "swap":
                this.swap();
                break;
        }
    }
    stbyInc() {
        let elem;
        switch (this.activeLine) {
            case 0:
                elem = this.r1;
                break;
            case 1:
                elem = this.r2;
                break;
            case 2:
                elem = this.r3;
                break;
            default:
                return;
        }
        let stby = this.readFreq(elem);
        let newValue = parseFloat((stby + 0.005).toFixed(3));
        if (!RadioNav.isHz833Compliant(newValue)) {
            newValue = parseFloat((newValue + 0.005).toFixed(3));
        }
        this.setFreq(elem, newValue);
    }
    stbyDec() {
        let elem;
        switch (this.activeLine) {
            case 0:
                elem = this.r1;
                break;
            case 1:
                elem = this.r2;
                break;
            case 2:
                elem = this.r3;
                break;
            default:
                return;
        }
        let stby = this.readFreq(elem);
        let newValue = parseFloat((stby - 0.005).toFixed(3));
        if (!RadioNav.isHz833Compliant(newValue)) {
            newValue = parseFloat((newValue - 0.005).toFixed(3));
        }
        this.setFreq(elem, newValue);
    }
    swap() {
        switch (this.activeLine) {
            case 0:
                var activeFreq = this.readFreq(this.l1);
                var stbyFreq = this.readFreq(this.r1);
                this.setFreq(this.r1, activeFreq);
                this.setFreq(this.l1, stbyFreq);
                this.com.radioNav.swapVHFFrequencies(this.com.instrumentIndex, 1);
                break;
            case 1:
                var activeFreq = this.readFreq(this.l2);
                var stbyFreq = this.readFreq(this.r2);
                this.setFreq(this.r2, activeFreq);
                this.setFreq(this.l2, stbyFreq);
                this.com.radioNav.swapVHFFrequencies(this.com.instrumentIndex, 2);
                break;
            case 2:
                var activeFreq = this.readFreq(this.l3);
                var stbyFreq = this.readFreq(this.r3);
                this.setFreq(this.r3, activeFreq);
                this.setFreq(this.l3, stbyFreq);
                this.com.radioNav.swapVHFFrequencies(this.com.instrumentIndex, 3);
                break;
        }
        this.updateSim();
    }
    checkFreq(_frq) {
        if (_frq >= 118 && _frq <= 136.9 && RadioNav.isHz833Compliant(_frq)) {
            return true;
        }
        return false;
    }
    setFreq(_elem, _frq) {
        if (isFinite(_frq) && _frq > 0)
            this.setValue(_elem, _frq.toFixed(3));
        else
            this.setValue(_elem, this.noFreq);
    }
    writeFreq(_elem) {
        if (this.input.textContent == this.inputClr) {
            this.setValue(_elem, this.noFreq);
            this.updateSim();
        }
        else {
            let freq = parseFloat(this.input.textContent);
            if (this.checkFreq(freq)) {
                this.setValue(_elem, freq.toFixed(3));
                this.input.textContent = "";
                this.updateSim();
            }
            else
                this.input.textContent = this.inputInvalid;
        }
    }
    readFreq(_elem) {
        let val = this.getValue(_elem);
        if (val != this.noFreq) {
            let frq = parseFloat(val);
            if (isFinite(frq))
                return frq;
        }
        return 0;
    }
    updateSim() {
        switch (this.activeLine) {
            case 0:
                var activeFreq = this.readFreq(this.l1);
                var stbyFreq = this.readFreq(this.r1);
                this.com.radioNav.setVHF1ActiveFrequency(this.com.instrumentIndex, activeFreq);
                this.com.radioNav.setVHF1StandbyFrequency(this.com.instrumentIndex, stbyFreq);
                break;
            case 1:
                var activeFreq = this.readFreq(this.l2);
                var stbyFreq = this.readFreq(this.r2);
                this.com.radioNav.setVHF2ActiveFrequency(this.com.instrumentIndex, activeFreq);
                this.com.radioNav.setVHF2StandbyFrequency(this.com.instrumentIndex, stbyFreq);
                break;
            case 2:
                var activeFreq = this.readFreq(this.l3);
                var stbyFreq = this.readFreq(this.r3);
                this.com.radioNav.setVHF3ActiveFrequency(this.com.instrumentIndex, activeFreq);
                this.com.radioNav.setVHF3StandbyFrequency(this.com.instrumentIndex, stbyFreq);
                break;
        }
    }
}
class B787_10_Com_XPDR extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#XPDR");
        this.noFreq = "0000";
    }
    show() {
        super.show();
        this.switchSide(true);
        this.switchMode(false);
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                this.writeFreq(this.l1);
                break;
        }
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        let code = SimVar.GetSimVarValue("TRANSPONDER CODE:1", "number");
        if (this.readFreq(this.l1) != code) {
            this.setFreq(this.l1, code);
        }
    }
    switchSide(_val) {
        if (_val)
            this.setHTML(this.l4, "<tspan style='fill:lime'>L</tspan><tspan style='font-size:26px'>-R</tspan>");
        else
            this.setHTML(this.l4, "<tspan style='font-size:26px'>L-</tspan><tspan style='fill:lime'>R</tspan>");
    }
    switchMode(_val) {
        if (_val)
            this.setHTML(this.r4, "<tspan style='fill:lime'>ABS</tspan><tspan style='font-size:26px'>-REL</tspan>");
        else
            this.setHTML(this.r4, "<tspan style='font-size:26px'>ABS-</tspan><tspan style='fill:lime'>REL</tspan>");
    }
    checkFreq(_frq) {
        return RadioNav.isXPDRCompliant(_frq);
    }
    setFreq(_elem, _frq) {
        if (isFinite(_frq) && _frq > 0)
            this.setValue(_elem, _frq.toFixed(0).padStart(4, "0"));
        else
            this.setValue(_elem, this.noFreq);
    }
    writeFreq(_elem) {
        if (this.input.textContent == this.inputClr) {
            this.setValue(_elem, this.noFreq);
            this.updateSim();
        }
        else {
            let freq = parseFloat(this.input.textContent);
            if (this.checkFreq(freq)) {
                this.setValue(_elem, freq.toFixed(0).padStart(4, "0"));
                this.input.textContent = "";
                this.updateSim();
            }
            else
                this.input.textContent = this.inputInvalid;
        }
    }
    readFreq(_elem) {
        let val = this.getValue(_elem);
        if (val != this.noFreq) {
            let frq = parseFloat(val);
            if (isFinite(frq))
                return frq;
        }
        return 0;
    }
    updateSim() {
        var freq = this.readFreq(this.l1);
        SimVar.SetSimVarValue("K:XPNDR_SET", "Frequency BCD16", Avionics.Utils.make_xpndr_bcd16(freq));
    }
}
class B787_10_Com_NAV extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#NAV");
        this.noFreq = "-----";
        this.noCourse = "---";
        this.ils = 0;
        this.course = 0;
        this.fmcILS = 0;
    }
    show() {
        super.show();
        this.setFreq(this.l1, this.ils);
        this.setCourse(this.l2, this.course);
        this.switch(this.com.radioNav.getRADIONAVActive(this.com.instrumentIndex));
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        let fmcILS = SimVar.GetSimVarValue("L:FLIGHTPLAN_APPROACH_ILS", "number");
        if (fmcILS != this.fmcILS) {
            this.fmcILS = fmcILS;
            this.ils = fmcILS;
            this.course = SimVar.GetSimVarValue("L:FLIGHTPLAN_APPROACH_COURSE", "number");
            this.setFreq(this.l1, this.ils);
            this.setCourse(this.l2, this.course);
        }
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                this.writeFreq(this.l1);
                break;
            case "L2":
                this.writeCourse(this.l2);
                break;
            case "R1":
                let active = this.com.radioNav.getRADIONAVActive(this.com.instrumentIndex);
                this.com.radioNav.setRADIONAVActive(this.com.instrumentIndex, !active).then(() => {
                    this.switch(!active);
                    this.updateSim();
                });
                break;
        }
    }
    switch(_val) {
        if (_val)
            this.setHTML(this.r1, "<tspan style='fill:lime'>ON</tspan><tspan style='font-size:26px'>-OFF</tspan>");
        else
            this.setHTML(this.r1, "<tspan style='font-size:26px'>ON-</tspan><tspan style='fill:lime'>OFF</tspan>");
    }
    checkFreq(_frq) {
        if (_frq >= 108 && _frq <= 111.95 && RadioNav.isHz50Compliant(_frq))
            return true;
        return false;
    }
    setFreq(_elem, _frq) {
        if (isFinite(_frq) && _frq > 0)
            this.setValue(_elem, _frq.toFixed(2));
        else
            this.setValue(_elem, this.noFreq);
    }
    writeFreq(_elem) {
        if (this.input.textContent == this.inputClr) {
            this.setValue(_elem, this.noFreq);
            this.updateSim();
        }
        else {
            let freq = parseFloat(this.input.textContent);
            if (this.checkFreq(freq)) {
                this.setValue(_elem, freq.toFixed(2));
                this.input.textContent = "";
                this.updateSim();
            }
            else
                this.input.textContent = this.inputInvalid;
        }
    }
    readFreq(_elem) {
        let val = this.getValue(_elem);
        if (val != this.noFreq) {
            let frq = parseFloat(val);
            if (isFinite(frq))
                return frq;
        }
        return 0;
    }
    setCourse(_elem, _crs) {
        if (isFinite(_crs) && _crs > 0)
            this.setValue(_elem, _crs.toFixed(0));
        else
            this.setValue(_elem, this.noCourse);
    }
    writeCourse(_elem) {
        if (this.input.textContent == this.inputClr) {
            this.setValue(_elem, this.noCourse);
            this.updateSim();
        }
        else {
            let crs = parseFloat(this.input.textContent);
            if (crs > 0 && crs <= 360) {
                this.setValue(_elem, crs.toFixed(0));
                this.input.textContent = "";
                this.updateSim();
            }
            else
                this.input.textContent = this.inputInvalid;
        }
    }
    readCourse(_elem) {
        let val = this.getValue(_elem);
        if (val != this.noCourse) {
            let crs = parseInt(val);
            if (isFinite(crs))
                return crs;
        }
        return 0;
    }
    updateSim() {
        this.ils = this.readFreq(this.l1);
        this.course = this.readCourse(this.l2);
        if (this.com.radioNav.getRADIONAVActive(this.com.instrumentIndex)) {
            this.com.radioNav.setILSActiveFrequency(1, this.ils);
        }
    }
}
class B787_10_Com_Menu extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#Menu");
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "L1":
                this.com.showPage(1);
                break;
            case "L2":
                this.com.showPage(2);
                break;
            case "L3":
                this.com.showPage(3);
                break;
            case "L4":
                this.com.showPage(4);
                break;
            case "R1":
                this.com.showPage(5);
                break;
            case "R2":
                this.com.showPage(6);
                break;
            case "R3":
                this.com.showPage(7);
                break;
            case "R4":
                this.com.showPage(8);
                break;
        }
    }
}
class B787_10_Com_HF extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#HF");
    }
}
class B787_10_Com_SAT extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#SAT");
    }
}
class B787_10_Com_CAB extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#CAB");
    }
}
class B787_10_Com_GPWS extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#GPWS");
    }
}
class B787_10_Com_WXR extends B787_10_Com_Page {
    constructor(_com) {
        super(_com, "#WXR");
    }
}
registerInstrument("b787-10-com-element", B787_10_Com);
//# sourceMappingURL=B787_10_COM.js.map