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
    Init() {
        super.Init();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
    }
}
class B787_10_HUD_Element extends NavSystemElement {
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
        super("Main", "MainFrame", new B787_10_HUD_Element());
        this.mainFrameTop = NaN;
        this.mainFrameLeft = NaN;
        this.mainFrameHeight = NaN;
        this.projectionOffset = 0;
        this.slidingSystems = new Array();
        this.attitude = new B787_10_HUD_Attitude();
        this.airspeed = new B787_10_HUD_Airspeed();
        this.altimeter = new B787_10_HUD_Altimeter();
        this.compass = new B787_10_HUD_Compass();
        this.fma = new B787_10_HUD_NavStatus();
        this.ils = new B787_10_HUD_ILS();
        this.element = new NavSystemElementGroup([
            this.attitude,
            this.airspeed,
            this.altimeter,
            this.fma,
            this.ils,
            this.compass
        ]);
        this.slidingSystems.push(this.attitude);
        this.slidingSystems.push(this.fma);
        this.slidingSystems.push(this.compass);
        this.slidingSystems.push(this.ils);
    }
    init() {
        super.init();
        this.mainFrame = this.gps.getChildById("MainFrame");
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        this.updateProjection(_deltaTime);
    }
    isProjectionReady() {
        if (!this.mainFrame) {
            return false;
        }
        if (!isFinite(this.mainFrameHeight)) {
            let clientRect = this.mainFrame.getBoundingClientRect();
            if (!isFinite(clientRect.width) || clientRect.width <= 0) {
                return false;
            }
            this.mainFrameTop = clientRect.top;
            this.mainFrameLeft = clientRect.left;
            this.mainFrameHeight = clientRect.height;
            this.camIdealPos = new Vec3(0.5, 1.6, 25.4);
            this.hudIdealPos = this.camIdealPos.Add(0, 0, 0.75);
            this.camToHudIdealDir = this.camIdealPos.SubstractVec(this.hudIdealPos);
            this.camToHudIdealDir.Normalize();
        }
        for (let i = 0; i < this.slidingSystems.length; i++) {
            if (!this.slidingSystems[i].slidable()) {
                return false;
            }
        }
        return true;
    }
    updateProjection(_deltaTime) {
        if (!this.isProjectionReady())
            return;
        let xyz = SimVar.GetGameVarValue("CAMERA POS IN PLANE", "xyz");
        let camUserPos = new Vec3(xyz.x, xyz.y, xyz.z);
        let toPixel = this.mainFrameHeight * (1280 / this.mainFrameHeight);
        let mainFrameOffsetX = 0;
        let mainFrameOffsetY = 0;
        {
            let dotOffsetX = 0;
            {
                let camUserPosProjY = new Vec3();
                Object.assign(camUserPosProjY, camUserPos);
                camUserPosProjY.y = this.camIdealPos.y;
                let userToHudDir = camUserPosProjY.SubstractVec(this.hudIdealPos);
                userToHudDir.Normalize();
                dotOffsetX = userToHudDir.Dot(this.camToHudIdealDir);
                dotOffsetX = 1.0 - Math.abs(dotOffsetX);
                dotOffsetX *= (camUserPosProjY.x < this.camIdealPos.x) ? 1.0 : -1.0;
            }
            let dotOffsetY = 0;
            {
                let camUserPosProjX = new Vec3();
                Object.assign(camUserPosProjX, camUserPos);
                camUserPosProjX.x = this.camIdealPos.x;
                let userToHudDir = camUserPosProjX.SubstractVec(this.hudIdealPos);
                userToHudDir.Normalize();
                dotOffsetY = userToHudDir.Dot(this.camToHudIdealDir);
                dotOffsetY = 1.0 - Math.abs(dotOffsetY);
                dotOffsetY *= (camUserPosProjX.y < this.camIdealPos.y) ? 1.0 : -1.0;
            }
            mainFrameOffsetX = dotOffsetX * toPixel * 30;
            mainFrameOffsetY = dotOffsetY * toPixel * 75;
            this.mainFrame.style.left = this.mainFrameLeft + mainFrameOffsetX + "px";
            this.mainFrame.style.top = this.mainFrameTop + mainFrameOffsetY + "px";
        }
        let horizonOffset = 0;
        {
            {
                let planeAltitude = Simplane.getAltitude() / 3281;
                if (planeAltitude > Number.EPSILON) {
                    let horizonDistance = Math.sqrt(planeAltitude * (12742 + planeAltitude));
                    let correction = planeAltitude / horizonDistance;
                    horizonOffset += (7.0 * correction);
                }
            }
            {
                let deltaFeet = (camUserPos.y - this.camIdealPos.y) + 0.01;
                horizonOffset += (-6.0 * deltaFeet);
            }
            {
                let xyz = Simplane.getOrientationAxis();
                horizonOffset += (-1.25 * xyz.pitch);
            }
            horizonOffset *= toPixel;
            horizonOffset -= mainFrameOffsetY;
            this.projectionOffset = Utils.SmoothSin(this.projectionOffset, horizonOffset, 0.02, _deltaTime);
            for (let i = 0; i < this.slidingSystems.length; i++) {
                this.slidingSystems[i].slide(this.projectionOffset);
            }
        }
    }
    onEvent(_event) {
    }
}
class B787_10_HUD_System extends B787_10_HUD_Element {
    constructor() {
        super(...arguments);
        this.elementTop = NaN;
        this.slideMin = NaN;
        this.slideMax = NaN;
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
    }
    slidable() {
        if (!this.htmlElement) {
            return false;
        }
        if (!isFinite(this.elementTop)) {
            let clientRect = this.htmlElement.getBoundingClientRect();
            if (!isFinite(clientRect.width) || clientRect.width <= 0) {
                return false;
            }
            this.elementTop = clientRect.top;
        }
        return true;
    }
    slide(_delta) {
        if (this.slidable()) {
            let delta = _delta;
            if (isFinite(this.slideMin) && delta < this.slideMin) {
                delta = this.slideMin;
            }
            if (isFinite(this.slideMax) && delta > this.slideMax) {
                delta = this.slideMax;
            }
            this.htmlElement.style.top = this.elementTop + delta + "px";
        }
    }
}
class B787_10_HUD_Airspeed extends B787_10_HUD_System {
    get htmlElement() {
        return this.airspeed;
    }
    init(root) {
        super.init(root);
        this.airspeed = this.gps.getChildById("Airspeed");
        this.airspeed.aircraft = Aircraft.AS01B;
        this.airspeed.gps = this.gps;
    }
    onEnter() {
        super.onEnter();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        this.airspeed.update(_deltaTime);
    }
    onExit() {
        super.onExit();
    }
    onEvent(_event) {
        super.onEvent(_event);
    }
}
class B787_10_HUD_Altimeter extends B787_10_HUD_System {
    get htmlElement() {
        return this.altimeter;
    }
    init(root) {
        super.init(root);
        this.altimeter = this.gps.getChildById("Altimeter");
        this.altimeter.aircraft = Aircraft.AS01B;
        this.altimeter.gps = this.gps;
    }
    onEnter() {
        super.onEnter();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        this.altimeter.update(_deltaTime);
    }
    onExit() {
        super.onExit();
    }
    onEvent(_event) {
        super.onEvent(_event);
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
class B787_10_HUD_Attitude extends B787_10_HUD_System {
    get htmlElement() {
        return this.svg;
    }
    init(root) {
        super.init(root);
        this.svg = this.gps.getChildById("Horizon");
        this.svg.aircraft = Aircraft.AS01B;
        this.svg.gps = this.gps;
    }
    onEnter() {
        super.onEnter();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        var xyz = Simplane.getOrientationAxis();
        if (xyz) {
            let pitch = xyz.pitch;
            this.svg.setAttribute("pitch", (pitch / Math.PI * 180).toString());
            this.svg.setAttribute("bank", (xyz.bank / Math.PI * 180).toString());
        }
        this.svg.setAttribute("slip_skid", Simplane.getInclinometer().toString());
        this.svg.setAttribute("radio_altitude", Simplane.getAltitudeAboveGround().toString());
        this.svg.setAttribute("radio_decision_height", this.gps.radioNav.getRadioDecisionHeight().toString());
    }
    onExit() {
        super.onExit();
    }
    onEvent(_event) {
        super.onEvent(_event);
    }
}
class B787_10_HUD_NavStatus extends B787_10_HUD_System {
    get htmlElement() {
        return this.fma;
    }
    init(root) {
        super.init(root);
        this.slideMax = 0;
        this.fma = this.gps.querySelector("boeing-fma");
        this.fma.aircraft = Aircraft.AS01B;
        this.fma.gps = this.gps;
        this.isInitialized = true;
    }
    onEnter() {
        super.onEnter();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        if (this.fma != null) {
            this.fma.update(_deltaTime);
        }
    }
    onExit() {
        super.onExit();
    }
    onEvent(_event) {
        super.onEvent(_event);
    }
}
class B787_10_HUD_ILS extends B787_10_HUD_System {
    get htmlElement() {
        return this.ils;
    }
    init(root) {
        super.init(root);
        this.slideMin = 0;
        this.ils = this.gps.getChildById("ILS");
        this.ils.aircraft = Aircraft.AS01B;
        this.ils.gps = this.gps;
    }
    onEnter() {
        super.onEnter();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        if (this.ils) {
            let showIls = false;
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
        super.onExit();
    }
    onEvent(_event) {
        super.onEvent(_event);
    }
}
class B787_10_HUD_Compass extends B787_10_HUD_System {
    get htmlElement() {
        return this.svg;
    }
    init(root) {
        super.init(root);
        this.slideMin = 0;
        this.svg = this.gps.getChildById("Compass");
        this.svg.setMode(Jet_NDCompass_Display.ARC, Jet_NDCompass_Navigation.NAV);
        this.svg.aircraft = Aircraft.AS01B;
        this.svg.gps = this.gps;
    }
    onEnter() {
        super.onEnter();
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        if (this.svg) {
            this.svg.update(_deltaTime);
        }
    }
    onExit() {
        super.onExit();
    }
    onEvent(_event) {
        super.onEvent(_event);
    }
}
registerInstrument("b787-10-hud-element", B787_10_HUD);
//# sourceMappingURL=B787_10_HUD.js.map