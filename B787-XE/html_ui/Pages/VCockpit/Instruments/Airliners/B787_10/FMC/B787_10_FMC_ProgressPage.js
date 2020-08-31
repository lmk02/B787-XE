class B787_10_FMC_ProgressPage {
    static ShowPage1(fmc) {
        fmc.clearDisplay();
        fmc.setTemplate([
            ["PROGRESS", "1", "3"],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""]
        ]);
        fmc.updateSideButtonActiveStatus();
    }
}
//# sourceMappingURL=B787_10_FMC_ProgressPage.js.map