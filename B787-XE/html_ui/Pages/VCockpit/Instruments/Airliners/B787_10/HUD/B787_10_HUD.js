class B787_10_HUD extends BaseAirliners {
    constructor() {
        super();
        this.initDuration = 7000;
    }
    get templateID() { return "B787_10_HUD"; }
    get instrumentAlias() { return "AS01B_HUD"; }
    connectedCallback() {
        super.connectedCallback();
        this.pageGroups = [
            new NavSystemPageGroup("Main", this, [
                new B787_10_HUD_MainPage()
            ]),
        ];
        this.maxUpdateBudget = 12;
    }
    disconnectedCallback() {
        window.console.log("B787 HUD - destroyed");
        super.disconnectedCallback();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
    }
}
B787_10_HUD.PITCH_BEFORE_COMPASS_SLIDES_DOWN = -9;
B787_10_HUD.COMPASS_ANGLE_TO_PIXELS_FACTOR = 38;
B787_10_HUD.ILS_ANGLE_TO_PIXELS_FACTOR = 24;
class B787_10_HUD_MainElement extends NavSystemElement {
    init(root) {
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class B787_10_HUD_MainPage extends NavSystemPage {
    constructor() {
        super("Main", "MainFrame", new B787_10_HUD_MainElement());
        this.compass = new B787_10_HUD_Compass();
        this.mainFrameTop = NaN;
        this.mainFrameHeight = NaN;
        this.mainFrameTopOffset = 0;						
        this.element = new NavSystemElementGroup([
            new B787_10_HUD_Attitude(),
            new B787_10_HUD_Airspeed(),
            new B787_10_HUD_Altimeter(),
            new B787_10_HUD_NavStatus(),
            new B787_10_HUD_ILS(),
            this.compass
        ]);
    }
    init() {
        super.init();
        this.mainFrame = this.gps.getChildById("MainFrame");
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        if (this.mainFrame) {
            if (!isFinite(this.mainFrameTop)) {
                let clientRect = this.mainFrame.getBoundingClientRect();
                if (clientRect.width > 0) {
                    this.mainFrameTop = clientRect.top;
                    this.mainFrameHeight = clientRect.height;	 
                }					
    }
            else {
                let horizonOffset = 0;
                {
                    let planeAltitude = Simplane.getAltitude() / 3281;
                    let horizonDistance = Math.sqrt(planeAltitude * (12742 + planeAltitude));
                    let correction = planeAltitude / horizonDistance;
                    horizonOffset += (5.75 * correction);
                }
                {
                    let cameraHeight = SimVar.GetGameVarValue("CAMERA HEIGHT IN PLANE", "feet");
                    let deltaFeet = cameraHeight - 5.235;
                    horizonOffset += (-1.75 * deltaFeet);
                }
                {
                    let xyz = Simplane.getOrientationAxis();
                    horizonOffset += (-1.50 * xyz.pitch);
                }
                horizonOffset *= this.mainFrameHeight;
                this.mainFrameTopOffset = Utils.SmoothSin(this.mainFrameTopOffset, horizonOffset, 0.0075, _deltaTime);
                this.mainFrame.style.top = this.mainFrameTop + this.mainFrameTopOffset + "px";
            }
        }
    }
    onEvent(_event) {
    }
}
class B787_10_HUD_Airspeed extends NavSystemElement {
    constructor() {
        super();
    }
    init(root) {
        this.airspeed = this.gps.getChildById("Airspeed");
        this.airspeed.aircraft = Aircraft.AS01B;
        this.airspeed.gps = this.gps;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        this.airspeed.update(_deltaTime);
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class B787_10_HUD_Altimeter extends NavSystemElement {
    constructor() {
        super();
    }
    init(root) {
        this.altimeter = this.gps.getChildById("Altimeter");
        this.altimeter.aircraft = Aircraft.AS01B;
        this.altimeter.gps = this.gps;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        this.altimeter.update(_deltaTime);
    }
    onExit() {
    }
    onEvent(_event) {
        switch (_event) {
            case "BARO_INC":
                SimVar.SetSimVarValue("K:KOHLSMAN_INC", "number", 1);
                break;
            case "BARO_DEC":
                SimVar.SetSimVarValue("K:KOHLSMAN_DEC", "number", 1);
                break;
        }
    }
}
class B787_10_HUD_Attitude extends NavSystemElement {
    constructor() {
        super(...arguments);
        this.vDir = new Vec2();
    }
    init(root) {
        this.svg = this.gps.getChildById("Horizon");
        this.svg.aircraft = Aircraft.AS01B;
        this.svg.gps = this.gps;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        var xyz = Simplane.getOrientationAxis();
        if (xyz) {
            let pitch = xyz.pitch;
            this.svg.setAttribute("horizon", (pitch / Math.PI * 180).toString());
            this.svg.setAttribute("pitch", (pitch / Math.PI * 180).toString());
            this.svg.setAttribute("bank", (xyz.bank / Math.PI * 180).toString());
        }
        this.svg.setAttribute("slip_skid", Simplane.getInclinometer().toString());
        this.svg.setAttribute("radio_altitude", Simplane.getAltitudeAboveGround().toString());
        this.svg.setAttribute("radio_decision_height", this.gps.radioNav.getRadioDecisionHeight().toString());
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class B787_10_HUD_NavStatus extends NavSystemElement {
    init(root) {
        this.fma = this.gps.querySelector("boeing-fma");
        this.fma.aircraft = Aircraft.AS01B;
        this.fma.gps = this.gps;
        this.isInitialized = true;
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        if (this.fma != null) {
            this.fma.update(_deltaTime);
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
class B787_10_HUD_ILS extends NavSystemElement {
    init(root) {
        this.ils = this.gps.getChildById("ILS");
        this.ils.aircraft = Aircraft.AS01B;
        this.ils.gps = this.gps;
        this.ils.showNavInfo(true);
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        if (this.ils) {
            let showIls = true;
            let localizer = this.gps.radioNav.getBestILSBeacon(false);
            if (localizer.id != 0) {
                showIls = true;
            }
            this.ils.showLocalizer(showIls);
            this.ils.showGlideslope(showIls);
            this.ils.update(_deltaTime);
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
    static getYSlide() {
        let deltaPixels = 0;
        var xyz = Simplane.getOrientationAxis();
        if (xyz) {
            let maxPitch = B787_10_HUD.PITCH_BEFORE_COMPASS_SLIDES_DOWN;
            let factor = B787_10_HUD.ILS_ANGLE_TO_PIXELS_FACTOR;
            let pitch = xyz.pitch * Avionics.Utils.RAD2DEG;
            let deltaPitch = pitch - maxPitch;
            if (deltaPitch < 0) {
                deltaPixels = Math.abs(deltaPitch) * factor;
            }
        }
        return deltaPixels;
    }
}
class B787_10_HUD_Compass extends NavSystemElement {
    init(root) {
        this.svg = this.gps.getChildById("Compass");
        this.svg.setMode(Jet_NDCompass_Display.ARC, Jet_NDCompass_Navigation.NAV);
        this.svg.aircraft = Aircraft.AS01B;
        this.svg.gps = this.gps;
    }
    onEnter() {
    }
    isReady() {
        return true;
    }
    onUpdate(_deltaTime) {
        if (this.svg) {
            this.svg.update(_deltaTime);
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
    static getYSlide() {
        let deltaPixels = 0;
        var xyz = Simplane.getOrientationAxis();
        if (xyz) {
            let maxPitch = B787_10_HUD.PITCH_BEFORE_COMPASS_SLIDES_DOWN;
            let factor = B787_10_HUD.COMPASS_ANGLE_TO_PIXELS_FACTOR;
            let pitch = xyz.pitch * Avionics.Utils.RAD2DEG;
            let deltaPitch = pitch - maxPitch;
            if (deltaPitch < 0) {
                deltaPixels = Math.abs(deltaPitch) * factor;
            }
        }
        return deltaPixels;
    }
}
registerInstrument("b787-10-hud-element", B787_10_HUD);
//# sourceMappingURL=B787_10_HUD.js.map
