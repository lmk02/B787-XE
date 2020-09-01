class B787_10_MFD extends BaseAirliners {
    constructor() {
        super();
        this.initDuration = 0;
    }
    get templateID() { return "B787_10_MFD"; }
    get instrumentAlias() { return "AS01B_MFD"; }
    get IsGlassCockpit() { return true; }
    get isInteractive() { return true; }
    connectedCallback() {
        super.connectedCallback();
        this.pageGroups = [
            new NavSystemPageGroup("Main", this, [
                new MFDPage(this.instrumentIdentifier, "Mainframe", this.instrumentIndex)
            ]),
        ];
    }
    disconnectedCallback() {
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        this.updateAnnunciations();
    }
    updateAnnunciations() {
    }
}
var MFDPageType;
(function (MFDPageType) {
    MFDPageType[MFDPageType["SYS"] = 0] = "SYS";
    MFDPageType[MFDPageType["CDU"] = 1] = "CDU";
    MFDPageType[MFDPageType["INFO"] = 2] = "INFO";
    MFDPageType[MFDPageType["CHKL"] = 3] = "CHKL";
    MFDPageType[MFDPageType["COMM"] = 4] = "COMM";
    MFDPageType[MFDPageType["ND"] = 5] = "ND";
    MFDPageType[MFDPageType["EICAS"] = 6] = "EICAS";
})(MFDPageType || (MFDPageType = {}));
class MFDPage extends NavSystemPage {
    constructor(_name, _root, _index) {
        super(_name, _root, null);
        this.index = 0;
        this.allElements = new Array();
        this.hasEicas = false;
        this.mfdRight = false;
        this.index = _index;
        Coherent.on(_name.toUpperCase() + "_EXTERNAL_EVENT", this.onExternalEvent.bind(this));
        this.annunciations = new Cabin_Annunciations();
        this.warnings = new Cabin_Warnings();
        this.element = new NavSystemElementGroup([this.annunciations, this.warnings]);
    }
    init() {
        super.init();
        var root = this.gps.getChildById(this.htmlElemId);
        if (root != null) {
            let ndElement = root.querySelector("b787-10-nd-element");
            let cduElement = root.querySelector("b787-10-cdu-element");
            let sysElement = root.querySelector("b787-10-sys-element");
            let comElement = root.querySelector("b787-10-com-element");
            let chklElement = root.querySelector("b787-10-chkl-element");
            let infoElement = root.querySelector("b787-10-info-element");
            this.eicasElement = root.querySelector("b787-10-eicas-element");
            this.allElements.push(sysElement);
            this.allElements.push(cduElement);
            this.allElements.push(infoElement);
            this.allElements.push(chklElement);
            this.allElements.push(comElement);
            this.allElements.push(ndElement);
            this.allElements.push(this.eicasElement);
            for (var i = 0; i < this.allElements.length; ++i) {
                if (this.allElements[i] != null) {
                    this.allElements[i].setGPS(this.gps);
                    this.allElements[i].hide();
                }
            }
            this.hasEicas = (SimVar.GetSimVarValue("L:XMLVAR_EICAS_INDEX", "number") == (this.index - 1)) ? true : false;
            this.mfdRight = SimVar.GetSimVarValue("L:XMLVAR_MFD_SIDE_" + this.index, "bool");
            if (this.index == 1) {
                this.setPage(MFDPageType.SYS);
            }
            else if (this.index == 2) {
                this.setPage(MFDPageType.ND);
            }
            else if (this.index == 3) {
                this.setPage(MFDPageType.CDU);
            }
        }
    }
    onExternalEvent(..._args) {
        if ((_args != null) && (_args.length > 0)) {
            var strings = _args[0];
            if ((strings != null) && (strings.length > 0)) {
                this.onEvent(strings[0].toUpperCase());
            }
        }
    }
    onEvent(_event) {
        super.onEvent(_event);
        switch (_event) {
            case "SYS":
                this.setPage(MFDPageType.SYS);
                break;
            case "CDU":
                this.setPage(MFDPageType.CDU);
                break;
            case "INFO":
                this.setPage(MFDPageType.INFO);
                break;
            case "CHKL":
                this.setPage(MFDPageType.CHKL);
                break;
            case "COMM":
                this.setPage(MFDPageType.COMM);
                break;
            case "ND":
                this.setPage(MFDPageType.ND);
                break;
            case "EICAS":
                let index = SimVar.GetSimVarValue("L:XMLVAR_EICAS_INDEX", "number");
                SimVar.SetSimVarValue("L:XMLVAR_EICAS_INDEX", "number", (1 - index));
                break;
            case "MFD":
                let isLeft = SimVar.GetSimVarValue("L:XMLVAR_MFD_SIDE_" + this.index, "bool");
                SimVar.SetSimVarValue("L:XMLVAR_MFD_SIDE_" + this.index, "number", !isLeft);
                break;
        }
        if (this.allElements != null) {
            for (var i = 0; i < this.allElements.length; ++i) {
                if (this.allElements[i] != null) {
                    this.allElements[i].onEvent(_event);
                }
            }
        }
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        if (this.allElements != null) {
            for (var i = 0; i < this.allElements.length; ++i) {
                if (this.allElements[i] != null) {
                    this.allElements[i].update(_deltaTime);
                }
            }
        }
        let hasEicas = (SimVar.GetSimVarValue("L:XMLVAR_EICAS_INDEX", "number") == (this.index - 1)) ? true : false;
        if (hasEicas != this.hasEicas) {
            this.hasEicas = hasEicas;
            this.setPage(this.currentPage);
        }
        let mfdRight = SimVar.GetSimVarValue("L:XMLVAR_MFD_SIDE_" + this.index, "bool");
        if (mfdRight != this.mfdRight) {
            this.mfdRight = mfdRight;
            this.setPage(this.currentPage);
        }
        this.updateAnnunciations();
    }
    setPage(_page) {
        for (var i = 0; i < this.allElements.length; ++i) {
            if (this.allElements[i] != null) {
                this.allElements[i].hide();
            }
        }
        this.currentPage = _page;
        if (this.hasEicas) {
            if (!this.mfdRight) {
                if (this.index == 1) {
                    this.showPage(_page, 0, 50);
                    this.showPage(MFDPageType.EICAS, 50, 50);
                }
                else {
                    this.showPage(MFDPageType.EICAS, 0, 50);
                    this.showPage(_page, 50, 50);
                }
            }
            else {
                if (this.index == 1) {
                    this.showPage(MFDPageType.EICAS, 0, 50);
                    this.showPage(_page, 50, 50);
                }
                else {
                    this.showPage(_page, 0, 50);
                    this.showPage(MFDPageType.EICAS, 50, 50);
                }
            }
        }
        else {
            if (this.currentPage == MFDPageType.ND) {
                this.showPage(_page, 0, 100);
            }
            else if (!this.mfdRight) {
                this.showPage(_page, 0, 50);
                this.showPage(MFDPageType.ND, 50, 50);
            }
            else {
                this.showPage(MFDPageType.ND, 0, 50);
                this.showPage(_page, 50, 50);
            }
        }
    }
    showPage(_page, _xPercent, _widthPercent) {
        for (var i = 0; i < this.allElements.length; ++i) {
            if ((this.allElements[i] != null) && (this.allElements[i].pageIdentifier == _page)) {
                this.allElements[i].show(_xPercent, _widthPercent);
            }
        }
    }
    updateAnnunciations() {
        if (this.eicasElement) {
            let infoPanelManager = this.eicasElement.getInfoPanelManager();
            if (infoPanelManager) {
                infoPanelManager.clearScreen(Airliners.EICAS_INFO_PANEL_ID.PRIMARY);
                if (this.warnings) {
                    let text = this.warnings.getCurrentWarningText();
                    if (text && text != "") {
                        let level = this.warnings.getCurrentWarningLevel();
                        switch (level) {
                            case 0:
                                infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.INDICATION);
                                break;
                            case 1:
                                infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.CAUTION);
                                break;
                            case 2:
                                infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.WARNING);
                                break;
                        }
                    }
                }
                if (this.annunciations) {
                    for (let i = this.annunciations.displayWarning.length - 1; i >= 0; i--) {
                        if (!this.annunciations.displayWarning[i].Acknowledged)
                            infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, this.annunciations.displayWarning[i].Text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.WARNING);
                    }
                    for (let i = this.annunciations.displayCaution.length - 1; i >= 0; i--) {
                        if (!this.annunciations.displayCaution[i].Acknowledged)
                            infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, this.annunciations.displayCaution[i].Text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.CAUTION);
                    }
                    for (let i = this.annunciations.displayAdvisory.length - 1; i >= 0; i--) {
                        if (!this.annunciations.displayAdvisory[i].Acknowledged)
                            infoPanelManager.addMessage(Airliners.EICAS_INFO_PANEL_ID.PRIMARY, this.annunciations.displayAdvisory[i].Text, Airliners.EICAS_INFO_PANEL_MESSAGE_STYLE.INDICATION);
                    }
                }
            }
        }
    }
}
registerInstrument("b787-10-mfd-element", B787_10_MFD);
//# sourceMappingURL=B787_10_MFD.js.map