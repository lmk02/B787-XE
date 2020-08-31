class B787_10_FMC_DescentForecastPage {
    static ShowPage(fmc) {
        fmc.clearDisplay();
        let transLvl = fmc.descentForecast.transLvl > -1 ? "FL" + fmc.descentForecast.transLvl : "-----";
        let taiOnAlt = fmc.descentForecast.taiOnAlt > -1 ? "FL" + fmc.descentForecast.taiOnAlt : "-----";

        let template = [
            ["DESCENT FORECAST"],
            ["TRANS LVL", "TAI/ON ALT"],
            [transLvl, taiOnAlt],
            ["ALT", "WIND DIR/SPD"]
        ];

        fmc.descentForecast.forecast.forEach(function(x) {
            let alt = x[0] > -1 ? "FL" + x[0] : "-----";
            let dir = x[1] > -1 ? x[1] + "°" : "°---";
            let spd = x[2] > -1 ? x[2] : "KT ---";
            if (x[1] > -1 && x[2] > -1) {
                template.push([alt, "KT " + dir + "/" + spd]);
            } else {
                template.push([alt, spd + "/" + dir]);
            }
            template.push([]);
        });

        template.push(["<REQUEST", "<DES"]);

        fmc.setTemplate(template);

        fmc.onLeftInput[0] = () => { 
            let value = fmc.inOut;

            if (value.length > 0 && value.length < 4) {
                if (!isNaN(value)) {
                    fmc.inOut = "";
                    fmc.descentForecast.transLvl = parseInt(value);
                    B787_10_FMC_DescentForecastPage.ShowPage(fmc);
                } else {
                    fmc.showErrorMessage("INVALID ENTRY");
                }
            }
        };

        fmc.onRightInput[0] = () => { 
            let value = fmc.inOut;

            if (value.length > 0 && value.length < 4) {
                if (!isNaN(value)) {
                    fmc.inOut = "";
                    fmc.descentForecast.taiOnAlt = parseInt(value);
                    B787_10_FMC_DescentForecastPage.ShowPage(fmc);
                } else {
                    fmc.showErrorMessage("INVALID ENTRY");
                }
            }
        };
          

        for (let i = 1; i < 5; i++) {
            fmc.onLeftInput[i] = () => { 
                let value = fmc.inOut;
                if (value.length > 0 && value.length < 4) {
                    if (!isNaN(value)) {
                        fmc.inOut = "";
                        fmc.descentForecast.forecast[i-1][0] = parseInt(value);
                        B787_10_FMC_DescentForecastPage.ShowPage(fmc);
                    } else {
                        fmc.showErrorMessage("INVALID ENTRY");
                    }
                }
            };
            fmc.onRightInput[i] = () => { 
                let value = fmc.inOut;
                if (value.length > 0) {
                    if (value.includes("/"))
                    {
                        let s = value.split("/");
                        if (!isNaN(s[0]) && !isNaN(s[1] && s[0].length < 4 && s[1].length < 4)) {
                            fmc.inOut = "";
                            fmc.descentForecast.forecast[i-1][1] = parseInt(s[0]);
                            fmc.descentForecast.forecast[i-1][2] = parseInt(s[1]);
                            B787_10_FMC_DescentForecastPage.ShowPage(fmc);
                        } else {
                            fmc.showErrorMessage("INVALID ENTRY");
                        }
                    }
                }
            };
        }

        fmc.onRightInput[5] = () => { B787_10_FMC_VNAVPage.ShowPage3(fmc); };
        fmc.updateSideButtonActiveStatus();
    }


}
//# sourceMappingURL=B787_10_FMC_VNAVPage.js.map