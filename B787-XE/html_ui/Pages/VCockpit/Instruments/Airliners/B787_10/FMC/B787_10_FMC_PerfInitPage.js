class B787_10_FMC_PerfInitPage {
    static ShowPage1(fmc) {
        fmc.updateFuelVars().then(() => {
            fmc.clearDisplay();
            B787_10_FMC_PerfInitPage._timer = 0;
            fmc.pageUpdate = () => {
                B787_10_FMC_PerfInitPage._timer++;
                if (B787_10_FMC_PerfInitPage._timer >= 15) {
                    B787_10_FMC_PerfInitPage.ShowPage1(fmc);
                }
            };
            let grWtCell = "□□□.□";
            if (isFinite(fmc.getFuelVarsUpdatedGrossWeight(true))) {
                grWtCell = fmc.getFuelVarsUpdatedGrossWeight(true).toFixed(1) + " lb";
            }
            let crzAltCell = "□□□□□";
            if (fmc.cruiseFlightLevel) {
                crzAltCell = fmc.cruiseFlightLevel + "FL";
            }
            fmc.onRightInput[0] = () => {
                let value = fmc.inOut;
                fmc.clearUserInput();
                if (fmc.setCruiseFlightLevelAndTemperature(value)) {
                    B787_10_FMC_PerfInitPage.ShowPage1(fmc);
                }
            };
            let fuelCell = "□□□";
            if (fmc.getBlockFuel(true)) {
                fuelCell = fmc.getBlockFuel(true).toFixed(1) + " lb";
            }
            let zfwCell = "□□□.□";
            if (fmc.getZeroFuelWeight(true)) {
                zfwCell = fmc.getZeroFuelWeight(true).toFixed(1) + " lb";
            }
            fmc.onLeftInput[2] = () => {
                let value = fmc.inOut;
                fmc.clearUserInput();
                fmc.setZeroFuelWeight(value, (result) => {
                    if (result) {
                        B787_10_FMC_PerfInitPage.ShowPage1(fmc);
                    }
                }, true);
            };
            let crzCGCell = "20.0%";
            if (fmc.zeroFuelWeightMassCenter) {
                crzCGCell = fmc.zeroFuelWeightMassCenter.toFixed(1) + "%";
            }
            fmc.onRightInput[3] = () => {
                let value = fmc.inOut;
                fmc.clearUserInput();
                fmc.setZeroFuelCG(value, (result) => {
                    if (result) {
                        B787_10_FMC_PerfInitPage.ShowPage1(fmc);
                    }
                });
            };
            let costIndexCell = "□□□□";
            if (isFinite(fmc.costIndex)) {
                costIndexCell = fmc.costIndex.toFixed(0);
            }
            fmc.onRightInput[1] = () => {
                let value = fmc.inOut;
                fmc.clearUserInput();
                if (fmc.tryUpdateCostIndex(value, 10000)) {
                    B787_10_FMC_PerfInitPage.ShowPage1(fmc);
                }
            };
            let reservesCell = "□□□.□";
            let reserves = fmc.getFuelReserves();
            if (isFinite(reserves)) {
                reservesCell = reserves.toFixed(1) + " lb";
            }
            fmc.onLeftInput[3] = () => {
                let value = fmc.inOut;
                fmc.clearUserInput();
                if (fmc.setFuelReserves(value, true)) {
                    B787_10_FMC_PerfInitPage.ShowPage1(fmc);
                }
            };
            let stepSizeCell = "RVSM";
            fmc.setTemplate([
                ["PERF INIT"],
                ["GR WT", "CRZ ALT"],
                [grWtCell, crzAltCell],
                ["FUEL", "COST INDEX"],
                [fuelCell, costIndexCell],
                ["ZFW", "MIN FUEL TEMP"],
                [zfwCell, "-37°c"],
                ["RESERVES", "CRZ CG"],
                [reservesCell, crzCGCell],
                ["DATA LINK", "STEP SIZE"],
                ["NO COMM", stepSizeCell],
                ["--------------------------------------"],
                ["\<INDEX", "<THRUST LIM"]
            ]);
            fmc.onLeftInput[5] = () => { B787_10_FMC_InitRefIndexPage.ShowPage1(fmc); };
            fmc.onRightInput[5] = () => { B787_10_FMC_ThrustLimPage.ShowPage1(fmc); };
            fmc.updateSideButtonActiveStatus();
        });
    }
}
B787_10_FMC_PerfInitPage._timer = 0;
//# sourceMappingURL=B787_10_FMC_PerfInitPage.js.map