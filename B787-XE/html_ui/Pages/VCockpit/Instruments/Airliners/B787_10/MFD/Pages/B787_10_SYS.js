class B787_10_SYS extends B787_10_CommonMFD.MFDTemplateElement {
    constructor() {
        super(...arguments);
        this.allPageButtons = new Array();
        this.currentPage = null;
        this.navHighlight = -1;
        this.navHighlightTimer = -1.0;
        this.navHighlightLastIndex = 0;
    }
    get templateID() { return "B787_10_SYS_Template"; }
    get pageIdentifier() { return MFDPageType.SYS; }
    initChild() {
        if (this.allPageButtons == null) {
            this.allPageButtons = new Array();
        }
        var pageButtonSmallTemplate = this.querySelector("#PageButtonSmallTemplate");
        var pageButtonLargeTemplate = this.querySelector("#PageButtonLargeTemplate");
        if (pageButtonSmallTemplate != null) {
            this.allPageButtons.push(new B787_10_SYS_Page_STAT(this, pageButtonSmallTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_ELEC(this, pageButtonSmallTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_HYD(this, pageButtonSmallTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_FUEL(this, pageButtonSmallTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_AIR(this, pageButtonSmallTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_DOOR(this, pageButtonSmallTemplate));
            pageButtonSmallTemplate.remove();
        }
        if (pageButtonLargeTemplate != null) {
            this.allPageButtons.push(new B787_10_SYS_Page_GEAR(this, pageButtonLargeTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_FCTL(this, pageButtonLargeTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_EFIS_DSP(this, pageButtonLargeTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_MAINT(this, pageButtonLargeTemplate));
            this.allPageButtons.push(new B787_10_SYS_Page_CB(this, pageButtonLargeTemplate));
            pageButtonLargeTemplate.remove();
        }
        if (this.allPageButtons != null) {
            for (var i = 0; i < this.allPageButtons.length; ++i) {
                if (this.allPageButtons[i] != null) {
                    this.allPageButtons[i].init();
                }
            }
        }
        this.setPageActiveByName("FUEL");
    }
    updateChild(_deltaTime) {
        if (this.currentPage != null) {
            this.currentPage.update(_deltaTime);
        }
        if (this.navHighlightTimer >= 0) {
            this.navHighlightTimer -= _deltaTime / 1000;
            if (this.navHighlightTimer <= 0) {
                this.setNavHighlight(-1);
                this.navHighlightTimer = -1;
            }
        }
    }
    onEvent(_event) {
        if (_event.startsWith("CHANGE_SYS_PAGE_")) {
            this.setPageActiveByName(_event.replace("CHANGE_SYS_PAGE_", ""));
        }
        else {
            switch (_event) {
                case "Cursor_DEC":
                    if (this.navHighlight > 0)
                        this.setNavHighlight(this.navHighlight - 1);
                    else if (this.navHighlight == -1)
                        this.setNavHighlight(this.navHighlightLastIndex);
                    break;
                case "Cursor_INC":
                    if (this.navHighlight >= 0 && this.navHighlight < this.allPageButtons.length - 1)
                        this.setNavHighlight(this.navHighlight + 1);
                    else if (this.navHighlight == -1)
                        this.setNavHighlight(this.navHighlightLastIndex);
                    break;
                case "Cursor_Press":
                    if (this.navHighlight >= 0) {
                        this.allPageButtons[this.navHighlight].trigger();
                    }
                    break;
            }
        }
    }
    setGPS(_gps) {
    }
    setPageActiveByIndex(_index) {
        if ((_index >= 0) && (this.allPageButtons != null) && (_index < this.allPageButtons.length)) {
            for (var i = 0; i < this.allPageButtons.length; ++i) {
                if (this.allPageButtons[i] != null) {
                    if (i == _index) {
                        this.allPageButtons[i].isActive = true;
                        this.currentPage = this.allPageButtons[i];
                        this.navHighlightLastIndex = _index;
                    }
                    else {
                        this.allPageButtons[i].isActive = false;
                    }
                }
            }
        }
    }
    setPageActiveByName(_name) {
        if (this.allPageButtons != null) {
            for (var i = 0; i < this.allPageButtons.length; ++i) {
                if (this.allPageButtons[i] != null) {
                    if (_name == this.allPageButtons[i].getName()) {
                        this.setPageActiveByIndex(i);
                        break;
                    }
                }
            }
        }
    }
    setNavHighlight(_index) {
        if (this.navHighlight != _index) {
            if (this.navHighlight >= 0) {
                this.navHighlight = -1;
                this.navHighlightTimer = -1.0;
            }
            if (_index >= 0) {
                this.navHighlight = _index;
                this.navHighlightTimer = 5.0;
                this.navHighlightLastIndex = _index;
            }
            for (var i = 0; i < this.allPageButtons.length; ++i) {
                if (i == this.navHighlight) {
                    this.allPageButtons[i].isHighlight = true;
                }
                else {
                    this.allPageButtons[i].isHighlight = false;
                }
            }
        }
    }
}
class B787_10_SYS_Page {
    constructor(_sys, _buttonTemplate) {
        this.sys = null;
        this.buttonRoot = null;
        this.pageRoot = null;
        this.active = false;
        this.allTextValueComponents = new Array();
        this.gallonToMegagrams = 0;
        this.gallonToMegapounds = 0;
        this.sys = _sys;
        if (_sys != null) {
            var pageButtonRoot = _sys.querySelector("#" + this.getName() + "_PageButton");
            if ((pageButtonRoot != null) && (_buttonTemplate != null)) {
                this.buttonRoot = _buttonTemplate.cloneNode(true);
                this.buttonRoot.removeAttribute("id");
                pageButtonRoot.appendChild(this.buttonRoot);
                this.buttonRoot.addEventListener("mouseup", this.trigger.bind(this));
                var textElement = this.buttonRoot.querySelector("text");
                if (textElement != null) {
                    textElement.textContent = this.getName().replace("_", "/");
                }
            }
            this.pageRoot = _sys.querySelector("#" + this.getName() + "_Page");
        }
        this.gallonToMegagrams = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilogram") * 0.001;
        this.gallonToMegapounds = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "lbs") * 0.001;
    }
    set isActive(_active) {
        this.active = _active;
        if (this.buttonRoot != null) {
            if (this.active) {
                this.buttonRoot.classList.add("page-button-active");
                this.buttonRoot.classList.remove("page-button-inactive");
            }
            else {
                this.buttonRoot.classList.remove("page-button-active");
                this.buttonRoot.classList.add("page-button-inactive");
            }
        }
        if (this.pageRoot != null) {
            this.pageRoot.style.display = this.active ? "block" : "none";
        }
    }
    set isHighlight(_highlight) {
        if (this.buttonRoot != null) {
            if (_highlight) {
                this.buttonRoot.classList.add("page-button-highlight");
            }
            else {
                this.buttonRoot.classList.remove("page-button-highlight");
            }
        }
    }
    init() {
        if (this.pageRoot != null) {
            var inopText = document.createElementNS(Avionics.SVG.NS, "text");
            inopText.setAttribute("x", "50%");
            inopText.setAttribute("y", "5%");
            inopText.setAttribute("fill", "var(--eicasWhite)");
            inopText.setAttribute("fill", "var(--eicasWhite)");
            inopText.setAttribute("font-size", "45px");
            inopText.setAttribute("text-anchor", "middle");
            inopText.textContent = "INOP";
            this.pageRoot.appendChild(inopText);
        }
    }
    update(_deltaTime) {
        if (this.active) {
            if (this.allTextValueComponents != null) {
                for (var i = 0; i < this.allTextValueComponents.length; ++i) {
                    if (this.allTextValueComponents[i] != null) {
                        this.allTextValueComponents[i].refresh();
                    }
                }
            }
            this.updateChild(_deltaTime);
        }
    }
    trigger() {
        this.sys.onEvent("CHANGE_SYS_PAGE_" + this.getName());
    }
    getTotalFuelInMegagrams() {
        let factor = this.gallonToMegapounds;
        if (BaseAirliners.unitIsMetric(Aircraft.AS01B))
            factor = this.gallonToMegagrams;
        return (SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons") * factor);
    }
    getMainTankFuelInMegagrams(_index) {
        let factor = this.gallonToMegapounds;
        if (BaseAirliners.unitIsMetric(Aircraft.AS01B))
            factor = this.gallonToMegagrams;
        return (SimVar.GetSimVarValue("FUELSYSTEM TANK QUANTITY:" + _index, "gallons") * factor);
    }
}
class B787_10_SYS_Page_STAT extends B787_10_SYS_Page {
    init(){

        this.apuInfo = new B787_10_APU_INFO();

        this.n1L = 0;
        this.n1R = 0;
        
        this.hydActive = false;

        this.hydPress = 0;

        this.frame = 0;

        if (this.pageRoot != null) {
            this.hydL = this.pageRoot.querySelector("#hydL");
            this.hydC = this.pageRoot.querySelector("#hydC");
            this.hydR = this.pageRoot.querySelector("#hydR");

            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#apuRPM"), this.apuInfo.getRPM.bind(this), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#apuEGT"), this.apuInfo.getEGT.bind(this), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#oilPress"), this.apuInfo.getOilPress.bind(this), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#oilQty"), this.apuInfo.getOilQty.bind(this), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#oilTemp"), this.apuInfo.getOilTemp.bind(this), 1));

        }
        
    }

    updateChild(_deltaTime) {

        if ((this.frame = this.frame % 10) == 0)
        {
            this.n1L =  SimVar.GetSimVarValue("ENG N1 RPM:1", "percent");
            this.n1R =  SimVar.GetSimVarValue("ENG N1 RPM:2", "percent");
            if ((this.n1L > 10 && this.n1L < 18) || (this.n1R > 10 && this.n1R < 18))
            {
                this.hydActive = true;
            } else if (this.n1L < 10 && this.n1R < 10) {
                this.hydActive = false;
            } else if (this.n1L > 18 || this.n1R > 18) {
                this.hydPress = 5100;
                this.hydActive = true;
            }
            this.hydL.innerHTML = this.hydPress.toFixed(0);
            this.hydC.innerHTML = this.hydPress.toFixed(0);
            this.hydR.innerHTML = this.hydPress.toFixed(0);
        }

        if(this.hydActive && this.hydPress < 5100)
        {
            this.hydPress = this.hydPress+25;
        }

        if(!this.hydActive && this.hydPress > 0)
        {
            this.hydPress = this.hydPress-25;
        }

        this.frame++;
        

    }
    getName() { return "STAT"; }
}
class B787_10_SYS_Page_ELEC extends B787_10_SYS_Page {

    init() {

        this.n1L = 0;
        this.n1R = 0;

        this.apuRpm = 0;

        this.leftEngineStarted = false;
        this.rightEngineStarted = false;
        this.apuStarted = false;

        this.frame = 0;
        
        if (this.pageRoot != null) {
            this.extPwr3 = this.pageRoot.querySelector("#extPwr3");
            this.extPwr2 = this.pageRoot.querySelector("#extPwr2");
            this.extPwr1 = this.pageRoot.querySelector("#extPwr1");
            this.apuL = this.pageRoot.querySelector("#apuL");
            this.apuR = this.pageRoot.querySelector("#apuR");
            this.eng1 = this.pageRoot.querySelector("#eng1");
            this.eng2 = this.pageRoot.querySelector("#eng2");
            this.eng3 = this.pageRoot.querySelector("#eng3");
            this.eng4 = this.pageRoot.querySelector("#eng4");
            this.bus = this.pageRoot.querySelector("#bus");

            this.ext3pass = this.pageRoot.querySelector("#ext3pass");
            this.ext2pass = this.pageRoot.querySelector("#ext2pass");
            this.ext1pass = this.pageRoot.querySelector("#ext1pass");
            this.apuLpass = this.pageRoot.querySelector("#apuLpass");
            this.apuRpass = this.pageRoot.querySelector("#apuRpass");
            this.eng1pass = this.pageRoot.querySelector("#eng1pass");
            this.eng2pass = this.pageRoot.querySelector("#eng2pass");
            this.eng3pass = this.pageRoot.querySelector("#eng3pass");
            this.eng4pass = this.pageRoot.querySelector("#eng4pass");

            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#batVolts"), this.getBatVolts.bind(this), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#batAmps"), this.getBatAmps.bind(this), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#apuVolts"), this.getAPUVolts.bind(this), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#apuAmps"), this.getAPUAmps.bind(this), 1));
        }
    }

    getAPUVolts(){
        return SimVar.GetSimVarValue("APU VOLTS", "volt");
    }

    getAPUAmps(){
        var apuVolts = SimVar.GetSimVarValue("APU VOLTS", "volt");
        return (apuVolts > 1 ? 14 : 0);
    }

    getBatVolts(){
        return SimVar.GetSimVarValue("ELECTRICAL BATTERY VOLTAGE", "volt");
    }

    getBatAmps(){
        return SimVar.GetSimVarValue("ELECTRICAL BATTERY LOAD", "ampere");
    }

    updateChild(_deltaTime) {

        if ((this.frame = this.frame % 10) == 0)
        {
            var tempn1L = SimVar.GetSimVarValue("ENG N1 RPM:1", "percent");
            var tempn1R = SimVar.GetSimVarValue("ENG N1 RPM:2", "percent");

            if(tempn1L < 18)
            {
                if (tempn1L - 0.01 > this.n1L)
                {
                    this.eng1.setAttribute("class", "starting");
                    this.eng2.setAttribute("class", "starting");
                } else if ((tempn1L < this.n1L - 0.01) || tempn1L < 0.1) {
                    this.eng1.setAttribute("class", "off");
                    this.eng2.setAttribute("class", "off");
                }
                this.leftEngineStarted = false;
            } else {
                this.leftEngineStarted = true;
                this.eng1.setAttribute("class", "on");
                this.eng2.setAttribute("class", "on");
            }

            if(tempn1R < 18)
            {
                if (tempn1R - 0.01 > this.n1R)
                {
                    this.eng3.setAttribute("class", "starting");
                    this.eng4.setAttribute("class", "starting");
                } else if ((tempn1R < this.n1R - 0.01) || tempn1R < 0.1) {
                    this.eng3.setAttribute("class", "off");
                    this.eng4.setAttribute("class", "off");
                }
                this.rightEngineStarted = false;
            } else {
                this.rightEngineStarted = true;
                this.eng3.setAttribute("class", "on");
                this.eng4.setAttribute("class", "on");
            }

            this.n1L = tempn1L;
            this.n1R = tempn1R;

            var tempApuRpm = SimVar.GetSimVarValue("APU PCT RPM", "percent");
            
            if (tempApuRpm < 98)
            {
                if (tempApuRpm - 0.01 > this.apuRpm )
                {
                    this.apuL.setAttribute("class", "starting");
                    this.apuR.setAttribute("class", "starting");
                } else {
                    this.apuL.setAttribute("class", "off");
                    this.apuR.setAttribute("class", "off");
                }
                this.apuStarted = false;
            } else {
                this.apuStarted = true;
                this.apuL.setAttribute("class", "on");
                this.apuR.setAttribute("class", "on");
            }

            this.apuRpm = tempApuRpm;

            var extPwrL = SimVar.GetSimVarValue("EXTERNAL POWER ON:1", "bool");
            var extPwrR = SimVar.GetSimVarValue("EXTERNAL POWER ON:2", "bool");
            var extPwrAft = SimVar.GetSimVarValue("EXTERNAL POWER ON:3", "bool");
            var extPwrLAv = SimVar.GetSimVarValue("EXTERNAL POWER AVAILABLE:1", "bool")
            var extPwrRAv = SimVar.GetSimVarValue("EXTERNAL POWER AVAILABLE:2", "bool")
            var extPwrAftAv = SimVar.GetSimVarValue("EXTERNAL POWER AVAILABLE:3", "bool");

            var engAlt1 = SimVar.GetSimVarValue("GENERAL ENG MASTER ALTERNATOR:1", "bool");
            var engAlt2 = SimVar.GetSimVarValue("GENERAL ENG MASTER ALTERNATOR:2", "bool");
            var engAlt3 = SimVar.GetSimVarValue("GENERAL ENG MASTER ALTERNATOR:3", "bool");
            var engAlt4 = SimVar.GetSimVarValue("GENERAL ENG MASTER ALTERNATOR:4", "bool");

            var apuGen1 = SimVar.GetSimVarValue("APU GENERATOR SWITCH:1", "bool");
            var apuGen2 = SimVar.GetSimVarValue("APU GENERATOR SWITCH:2", "bool");


            this.extPwr1.setAttribute("class", extPwrLAv ? "on" : "off");
            this.extPwr2.setAttribute("class", extPwrRAv ? "on" : "off");
            this.extPwr3.setAttribute("class", extPwrAftAv ? "on" : "off");            

            var busActive = false;

            if (extPwrL && extPwrLAv) {
                this.ext1pass.setAttribute("visibility", "visible");
                busActive = true;
            } else {
                this.ext1pass.setAttribute("visibility", "hidden");
            }
            if (extPwrR && extPwrRAv) {
                this.ext2pass.setAttribute("visibility", "visible");
                busActive = true;
            } else {
                this.ext2pass.setAttribute("visibility", "hidden");
            }
            if (extPwrAft && extPwrAftAv) {
                this.ext3pass.setAttribute("visibility", "visible");
                busActive = true;
            } else {
                this.ext3pass.setAttribute("visibility", "hidden");
            }
            if (this.leftEngineStarted && engAlt1) {
                this.eng1pass.setAttribute("visibility", "visible");
                busActive = true;
            } else {
                this.eng1pass.setAttribute("visibility", "hidden");
            }
            if (this.leftEngineStarted && engAlt2) {
                this.eng2pass.setAttribute("visibility", "visible");
                busActive = true;
            } else {
                this.eng2pass.setAttribute("visibility", "hidden");
            }
            if (this.rightEngineStarted && engAlt3) {
                this.eng3pass.setAttribute("visibility", "visible");
                busActive = true;
            } else {
                this.eng3pass.setAttribute("visibility", "hidden");
            }
            if (this.rightEngineStarted && engAlt4) {
                this.eng4pass.setAttribute("visibility", "visible");
                busActive = true;
            } else {
                this.eng4pass.setAttribute("visibility", "hidden");
            }
            if (this.apuStarted && apuGen1) {
                this.apuLpass.setAttribute("visibility", "visible");
                busActive = true;
            } else {
                this.apuLpass.setAttribute("visibility", "hidden");
            }
            if (this.apuStarted && apuGen2) {
                this.apuRpass.setAttribute("visibility", "visible");
                busActive = true;
            } else {
                this.apuRpass.setAttribute("visibility", "hidden");
            }

            this.bus.setAttribute("class", busActive ? "on" : "off");
        }
        this.frame++;

    }
    getName() { return "ELEC"; }
}
class B787_10_SYS_Page_HYD extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "HYD"; }
}
class B787_10_SYS_Page_FUEL extends B787_10_SYS_Page {
    constructor() {
        super(...arguments);
        this.allFuelComponents = null;
    }
    init() {
        if (this.allFuelComponents == null) {
            this.allFuelComponents = new Array();
        }
        if (this.pageRoot != null) {
            this.unitTextSVG = this.pageRoot.querySelector("#TotalFuelUnits");
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#TotalFuelValue"), this.getTotalFuelInMegagrams.bind(this), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#Tank1Quantity"), this.getMainTankFuelInMegagrams.bind(this, 1), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#Tank2Quantity"), this.getMainTankFuelInMegagrams.bind(this, 2), 1));
            this.allTextValueComponents.push(new Airliners.DynamicValueComponent(this.pageRoot.querySelector("#Tank3Quantity"), this.getMainTankFuelInMegagrams.bind(this, 3), 1));
            this.allFuelComponents.push(new Boeing.FuelEngineState(this.pageRoot.querySelector("#Engine1FuelState"), 1));
            this.allFuelComponents.push(new Boeing.FuelEngineState(this.pageRoot.querySelector("#Engine2FuelState"), 2));
            var fuelPumpsGroup = this.pageRoot.querySelector("#FuelPumps");
            if (fuelPumpsGroup != null) {
                var allFuelPumps = fuelPumpsGroup.querySelectorAll("rect");
                if (allFuelPumps != null) {
                    for (var i = 0; i < allFuelPumps.length; ++i) {
                        this.allFuelComponents.push(new Boeing.FuelPump(allFuelPumps[i], parseInt(allFuelPumps[i].id.replace("FuelPump", ""))));
                    }
                }
            }
            var fuelValvesGroup = this.pageRoot.querySelector("#FuelValves");
            if (fuelValvesGroup != null) {
                var fuelValveTemplate = this.pageRoot.querySelector("#FuelValveTemplate");
                if (fuelValveTemplate != null) {
                    var allFuelValves = fuelValvesGroup.querySelectorAll("g");
                    if (allFuelValves != null) {
                        for (var i = 0; i < allFuelValves.length; ++i) {
                            var clonedValve = fuelValveTemplate.cloneNode(true);
                            clonedValve.removeAttribute("id");
                            allFuelValves[i].appendChild(clonedValve);
                            this.allFuelComponents.push(new Boeing.FuelValve(allFuelValves[i], parseInt(allFuelValves[i].id.replace("FuelValve", ""))));
                        }
                    }
                    fuelValveTemplate.remove();
                }
            }
            var fuelLinesGroup = this.pageRoot.querySelector("#FuelLines");
            if (fuelLinesGroup != null) {
                var allFuelLines = fuelLinesGroup.querySelectorAll("line, polyline, g");
                if (allFuelLines != null) {
                    for (var i = 0; i < allFuelLines.length; ++i) {
                        var id = parseInt(allFuelLines[i].id.replace("FuelLine", ""));
                        if ((id != NaN) && (id > 0)) {
                            this.allFuelComponents.push(new Boeing.FuelLine(allFuelLines[i], id));
                        }
                    }
                }
            }
        }
        if (this.allFuelComponents != null) {
            for (var i = 0; i < this.allFuelComponents.length; ++i) {
                if (this.allFuelComponents[i] != null) {
                    this.allFuelComponents[i].init();
                }
            }
        }
    }
    updateChild(_deltaTime) {
        if (this.allFuelComponents != null) {
            for (var i = 0; i < this.allFuelComponents.length; ++i) {
                if (this.allFuelComponents[i] != null) {
                    this.allFuelComponents[i].update(_deltaTime);
                }
            }
        }
        if (this.unitTextSVG) {
            if (BaseAirliners.unitIsMetric(Aircraft.B747_8))
                this.unitTextSVG.textContent = "KGS X 1000";
            else
                this.unitTextSVG.textContent = "LBS X 1000";
        }
    }
    getName() { return "FUEL"; }
}
class B787_10_SYS_Page_AIR extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "AIR"; }
}
class B787_10_SYS_Page_DOOR extends B787_10_SYS_Page {

    constructor() {
        super(...arguments);
    }

    init() {
        if (this.pageRoot != null) {
            this.doorFront = this.pageRoot.querySelector("#entry1lOpen");
            this.doorFrontClosed = this.pageRoot.querySelector("#entry1lClosed");
            this.doorBack = this.pageRoot.querySelector("#entry4rOpen");
            this.doorBackClosed = this.pageRoot.querySelector("#entry4rClosed");
            this.fwdCargoDoor = this.pageRoot.querySelector("#fwdCargoOpen");

            this.doorFront.setAttribute("visibility", "hidden");
            this.doorFrontClosed.setAttribute("visibility", "visible");
            this.doorBack.setAttribute("visibility", "hidden");
            this.doorBackClosed.setAttribute("visibility", "visible");
            this.fwdCargoDoor.setAttribute("visibility", "hidden");
            this.frame = 0;
        }

    }

    updateChild(_deltaTime) {

        if ((this.frame = this.frame % 10) == 0)
        {

            var leftFrontDoorStatus = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:0", "percent");
            var rightBackDoorStatus = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:7", "percent");
            var fwdCargoDoorStatus = SimVar.GetSimVarValue("INTERACTIVE POINT OPEN:8", "percent");



            if(leftFrontDoorStatus > 10)
            {
                this.doorFront.setAttribute("visibility", "visible");
                this.doorFrontClosed.setAttribute("visibility", "hidden");
            } else {
                this.doorFront.setAttribute("visibility", "hidden");
                this.doorFrontClosed.setAttribute("visibility", "visible");
            }
            if(rightBackDoorStatus > 10)
            {
                this.doorBack.setAttribute("visibility", "visible");
                this.doorBackClosed.setAttribute("visibility", "hidden");
            } else {
                this.doorBack.setAttribute("visibility", "hidden");
                this.doorBackClosed.setAttribute("visibility", "visible");
            }
            if(fwdCargoDoorStatus > 10)
            {
                this.fwdCargoDoor.setAttribute("visibility", "visible");
            } else {
                this.fwdCargoDoor.setAttribute("visibility", "hidden");
            }
        }
        this.frame++;

    }
    getName() { return "DOOR"; }
}
class B787_10_SYS_Page_GEAR extends B787_10_SYS_Page {

    init() {
		Include.addScript("/JS/debug.js", function () {
				g_modDebugMgr.AddConsole(null);
		});
        if (this.pageRoot != null) {
            this.gearDisplay = new Boeing.GearDisplay(this.pageRoot.querySelector("#gearDoor"));
        }
    }

    updateChild(_deltaTime) {
        if (this.gearDisplay != null) {
            this.gearDisplay.update(_deltaTime);
        }

    }
    getName() { return "GEAR"; }
}
class B787_10_SYS_Page_FCTL extends B787_10_SYS_Page {
	init() {
		if (this.pageRoot != null) {
            this.stabDisplay = new Boeing.StabDisplay(this.pageRoot.querySelector("#stab"));
			this.rudderDisplay = new Boeing.RudderDisplay(this.pageRoot.querySelector("#rudder_trim"));
			this.leftElevatorCursor = this.pageRoot.querySelector("#leftElevatorCursor");
			this.rightElevatorCursor = this.pageRoot.querySelector("#rightElevatorCursor");
			this.rudderCursor = this.pageRoot.querySelector("#rudderCursor");
			this.leftAileronCursor = this.pageRoot.querySelector("#leftAileronCursor");
			this.rightAileronCursor = this.pageRoot.querySelector("#rightAileronCursor");
			this.leftFlaperonCursor = this.pageRoot.querySelector("#leftFlaperonCursor");
			this.rightFlaperonCursor = this.pageRoot.querySelector("#rightFlaperonCursor");
			this.leftSpoilerBg = this.pageRoot.querySelector("#leftSpoilerBg");
			this.rightSpoilerBg = this.pageRoot.querySelector("#rightSpoilerBg");
			this.hydLeft = this.pageRoot.querySelectorAll(".hleft");
			this.hydCenter = this.pageRoot.querySelectorAll(".hcenter");
			this.hydRight = this.pageRoot.querySelectorAll(".hright");
			
			this.engLeftState = false;
			this.engRightState = false;
        }
    }
	
	update(_deltaTime) {
		this.elevatorsUpdate(_deltaTime);
		this.rudderUpdate(_deltaTime);
		this.aileronUpdate(_deltaTime);
		this.spoilersUpdate(_deltaTime);
		this.updateHydraulics(_deltaTime);
		
		if (this.stabDisplay != null) {
			this.stabDisplay.update(_deltaTime);
		}
		if (this.rudderDisplay != null) {
			this.rudderDisplay.update(_deltaTime);
		}
	}
	
	updateHydraulics(_deltaTime) {
		const engCombustionFirst = SimVar.GetSimVarValue("ENG COMBUSTION:1", "Bool") === 1;
		const engCombustionSecond = SimVar.GetSimVarValue("ENG COMBUSTION:2", "Bool") === 1;
		
		if (this.engLeftState !== engCombustionFirst || this.engRightState !== engCombustionSecond) {
			for(const node of this.hydCenter) {
				node.classList.remove(engCombustionFirst && engCombustionSecond ? "fail" : "success");
				node.classList.add(engCombustionFirst && engCombustionSecond ? "success" : "fail");
			}
		}
		
		if (this.engLeftState !== engCombustionFirst) {
			this.engLeftState = engCombustionFirst;
			for(const node of this.hydLeft) {
				node.classList.remove(engCombustionFirst ? "fail" : "success");
				node.classList.add(engCombustionFirst ? "success" : "fail");
			}
		}
		
		if (this.engRightState !== engCombustionSecond) {
			this.engRightState = engCombustionSecond
			for(const node of this.hydRight) {
				node.classList.remove(engCombustionSecond ? "fail" : "success");
				node.classList.add(engCombustionSecond ? "success" : "fail");
			}
		}
	}
	
	spoilersUpdate(_deltaTime) {
		const spoilersLeftPosition = SimVar.GetSimVarValue("SPOILERS LEFT POSITION", "percent over 100");
		const spoilersLeftPositionNo = spoilersLeftPosition * 80;
		const spoilersLeftPositionData = "M120,444 l0,-" + spoilersLeftPositionNo + " l35,0 0," + spoilersLeftPositionNo + " M165,444 l0,-" + spoilersLeftPositionNo + " l35,0 0," + spoilersLeftPositionNo + " M210,444 l0,-" + spoilersLeftPositionNo + " l35,0 0," + spoilersLeftPositionNo + " M255,444 l0,-" + spoilersLeftPositionNo + " l35,0 0," + spoilersLeftPositionNo + " M360,444 l0,-" + spoilersLeftPositionNo + " l35,0 0," + spoilersLeftPositionNo + " M405,444 l0,-" + spoilersLeftPositionNo + " l35,0 0," + spoilersLeftPositionNo + " M450,444 l0,-" + spoilersLeftPositionNo + " l35,0 0," + spoilersLeftPositionNo;
		
		const spoilersRightPosition = SimVar.GetSimVarValue("SPOILERS RIGHT POSITION", "percent over 100");
		const spoilersRightPositionNo = spoilersRightPosition * 80;
		const spoilersRightPositionData = "M725,444 l0,-" + spoilersRightPositionNo + " l35,0 0," + spoilersRightPositionNo + " M770,444 l0,-" + spoilersRightPositionNo + " l35,0 0," + spoilersRightPositionNo + " M815,444 l0,-" + spoilersRightPositionNo + " l35,0 0," + spoilersRightPositionNo + " M915,444 l0,-" + spoilersRightPositionNo + " l35,0 0," + spoilersRightPositionNo + " M960,444 l0,-" + spoilersRightPositionNo + " l35,0 0," + spoilersRightPositionNo + " M1005,444 l0,-" + spoilersRightPositionNo + " l35,0 0," + spoilersRightPositionNo + " M1050,444 l0,-" + spoilersRightPositionNo + " l35,0 0," + spoilersRightPositionNo;
		
		this.leftSpoilerBg.setAttribute("d", spoilersLeftPositionData);
		this.rightSpoilerBg.setAttribute("d", spoilersRightPositionData);
	}

	aileronUpdate() {
		const leftAileronDeflectPct = SimVar.GetSimVarValue("AILERON LEFT DEFLECTION PCT", "percent over 100");
		const leftFlaperonPositionNo = leftAileronDeflectPct * 82;
		const leftFlaperonPosition = "M340," + (587 + leftFlaperonPositionNo) + " l-25,-10 l0,20";
		const leftAileronDeflectPctNo = leftAileronDeflectPct * 90 * (leftAileronDeflectPct < 0 ? 1.28 : 0.73);
		const leftAileronPosition = "M88," + (620 + leftAileronDeflectPctNo) + " l-25,-10 l0,20";
		this.leftAileronCursor.setAttribute("d", leftAileronPosition);
		
		const rightAileronDeflectPct = SimVar.GetSimVarValue("AILERON RIGHT DEFLECTION PCT", "percent over 100");
		const rightFlaperonPositionNo = rightAileronDeflectPct * 82;
		const rightFlaperonPosition = "M822," + (587 - rightFlaperonPositionNo) + " l25,-10 l0,20";
		const rightAileronDeflectPctNo = rightAileronDeflectPct * 90 * (rightAileronDeflectPct > 0 ? 1.28 : 0.73);
		const rightAileronPosition = "M1078," + (620 - rightAileronDeflectPctNo) + "  l25,-10 l0,20";
		this.rightAileronCursor.setAttribute("d", rightAileronPosition);
		
		// we have no flaperons position params, use ailerons
		this.leftFlaperonCursor.setAttribute("d", leftFlaperonPosition);
		this.rightFlaperonCursor.setAttribute("d", rightFlaperonPosition);
	}
	
	rudderUpdate(_deltaTime) {
		const rudderDeflectionPct = SimVar.GetSimVarValue("RUDDER DEFLECTION PCT", "percent over 100");
		const rudderDeflectionPctNo = rudderDeflectionPct * 164;
		const rudderPosition = "M" + (604 + rudderDeflectionPctNo) + ",1240 l10,25 l-20,0";
		this.rudderCursor.setAttribute("d", rudderPosition);
	}
	
	elevatorsUpdate(_deltaTime) {
		const elevatorDeflectionPct = SimVar.GetSimVarValue("ELEVATOR DEFLECTION PCT", "percent over 100");
		const elevatorDeflectionPctNo = elevatorDeflectionPct * 70 * (elevatorDeflectionPct < 0 ? 1.48 : 1);
		
		const leftCursorPosition = "M392," + (1150 + elevatorDeflectionPctNo) + " l-25,-10 l0,20";
		const rightCursorPosition = "M826," + (1150 + elevatorDeflectionPctNo) + " l25,-10 l0,20";
		this.leftElevatorCursor.setAttribute("d", leftCursorPosition);
		this.rightElevatorCursor.setAttribute("d", rightCursorPosition);
	}
	
    getName() { return "FCTL"; }
}
class B787_10_SYS_Page_EFIS_DSP extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "EFIS_DSP"; }
}
class B787_10_SYS_Page_MAINT extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "MAINT"; }
}
class B787_10_SYS_Page_CB extends B787_10_SYS_Page {
    updateChild(_deltaTime) {
    }
    getName() { return "CB"; }
}

class B787_10_APU_INFO {
    constructor(){
        this.rpmPct = 0;
    }

    getRPM()
    {
        this.rpmPct = SimVar.GetSimVarValue("APU PCT RPM", "percent");
        return ((1 - Math.exp(-this.rpmPct/100 * 4)) * 103.7);
    }

    getEGT()
    {
        this.rpmPct = SimVar.GetSimVarValue("APU PCT RPM", "percent");
        return ((1 - Math.exp(-this.rpmPct/100 * 3)) * 302.4 + 30); 
    }

    getOilPress()
    {
        this.rpmPct = SimVar.GetSimVarValue("APU PCT RPM", "percent");
        return ((1 - Math.exp(-this.rpmPct/100 * 3)) * 69.2 + 18);
    }
    getOilTemp()
    {
        this.rpmPct = SimVar.GetSimVarValue("APU PCT RPM", "percent");
        return ((1 - Math.exp(-this.rpmPct/100 * 3)) * 13.5 + 32);
    }
    getOilQty()
    {
        return 13;
    }
}
customElements.define("b787-10-sys-element", B787_10_SYS);
//# sourceMappingURL=B787_10_SYS.js.map