class B787_10_VSpeed extends Boeing_FCU.VSpeed {
    get templateID() { return "B787_10_VSpeed"; }
    get instrumentAlias() { return "AS01B_VSpeed"; }
    shouldBeVisible() {
        return SimVar.GetSimVarValue("L:AP_VS_ACTIVE", "number") === 1;
    }
}
registerInstrument("b787-10-vspeed-element", B787_10_VSpeed);
//# sourceMappingURL=B787_10_VSpeed.js.map