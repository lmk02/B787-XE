class B787_10_FMC_ThrustLimPage {
    static ShowPage1(fmc) {
        fmc.clearDisplay();
        let selectedTempCell = fmc.getThrustTakeOffTemp() + "°";
        fmc.onLeftInput[0] = () => {
            let value = fmc.inOut;
            fmc.clearUserInput();
            if (fmc.setThrustTakeOffTemp(value)) {
                B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
            }
        };
        let toN1Cell = fmc.getThrustTakeOffLimit().toFixed(1) + "%";
        let oatValue = SimVar.GetSimVarValue("AMBIENT TEMPERATURE", "celsius");
        let oatCell = oatValue.toFixed(1) + "°";
        let thrustTOMode = fmc.getThrustTakeOffMode();
        let thrustClimbMode = fmc.getThrustCLBMode();
        fmc.onLeftInput[1] = () => {
            fmc.setThrustTakeOffMode(0);
            fmc.setThrustCLBMode(0);
            B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
        };
        fmc.onLeftInput[2] = () => {
            fmc.setThrustTakeOffMode(1);
            fmc.setThrustCLBMode(1);
            B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
        };
        fmc.onLeftInput[3] = () => {
            fmc.setThrustTakeOffMode(2);
            fmc.setThrustCLBMode(2);
            B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
        };
        fmc.onRightInput[1] = () => {
            fmc.setThrustCLBMode(0);
            B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
        };
        fmc.onRightInput[2] = () => {
            fmc.setThrustCLBMode(1);
            B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
        };
        fmc.onRightInput[3] = () => {
            fmc.setThrustCLBMode(2);
            B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
        };
        fmc.setTemplate([
            ["THRUST LIM"],
            ["SEL", "TO N1", "OAT"],
            [selectedTempCell, toN1Cell, oatCell],
            [""],
            ["\<TO" + (thrustTOMode === 0 ? " <SEL>" : ""), (thrustClimbMode === 0 ? "<SEL> " : "") + "<CLB"],
            ["TO 1"],
            ["\<-10%" + (thrustTOMode === 1 ? " <SEL>" : ""), (thrustClimbMode === 1 ? "<SEL> " : "") + "<CLB 1"],
            ["TO 2"],
            ["\<-20%" + (thrustTOMode === 2 ? " <SEL>" : ""), (thrustClimbMode === 2 ? "<SEL> " : "") + "<CLB 2"],
            [""],
            ["\<TO-B"],
            ["__FMCSEPARATOR"],
            ["\<INDEX", "<TAKEOFF"]
        ]);
        fmc.onLeftInput[5] = () => { B787_10_FMC_InitRefIndexPage.ShowPage1(fmc); };
        fmc.onRightInput[5] = () => { B787_10_FMC_TakeOffRefPage.ShowPage1(fmc); };
        fmc.updateSideButtonActiveStatus();
    }
}
//# sourceMappingURL=B787_10_FMC_ThrustLimPage.js.map