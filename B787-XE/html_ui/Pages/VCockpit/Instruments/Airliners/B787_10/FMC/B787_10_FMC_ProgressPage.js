class B787_10_FMC_ProgressPage {
    static ShowPage1(fmc) {
        fmc.clearDisplay();
        B787_10_FMC_ProgressPage._timer = 0;
        fmc.pageUpdate = () => {
            B787_10_FMC_ProgressPage._timer++;
            if (B787_10_FMC_ProgressPage._timer >= 15) {
                B787_10_FMC_ProgressPage.ShowPage1(fmc);
            }
        };
        let planeCoordinates = new LatLong(SimVar.GetSimVarValue("PLANE LATITUDE", "degree latitude"), SimVar.GetSimVarValue("PLANE LONGITUDE", "degree longitude"));
        let waypointFromCell = "";
        let waypointFromAltCell = "";
        let waypointFromAtaCell = "";
        let waypointFromFuelCell = "";
        let waypointFrom;
        if (fmc.flightPlanManager.getActiveWaypointIndex() === -1) {
            waypointFrom = fmc.flightPlanManager.getOrigin();
        }
        else {
            waypointFrom = fmc.flightPlanManager.getPreviousActiveWaypoint();
        }
        if (waypointFrom) {
            waypointFromCell = waypointFrom.ident;
            if (isFinite(waypointFrom.altitudeWasReached) && isFinite(waypointFrom.timeWasReached)) {
                let t = waypointFrom.timeWasReached;
                let hours = Math.floor(t / 3600);
                let minutes = Math.floor((t - hours * 3600) / 60);
                waypointFromAltCell = waypointFrom.altitudeWasReached.toFixed(0);
                waypointFromAtaCell = hours.toFixed(0).padStart(2, "0") + minutes.toFixed(0).padStart(2, "0");
            }
            if (isFinite(waypointFrom.fuelWasReached)) {
                waypointFromFuelCell = waypointFrom.getFuelWasReached(true).toFixed(0);
            }
        }
        let speed = Simplane.getGroundSpeed();
        let currentTime = SimVar.GetGlobalVarValue("LOCAL TIME", "seconds");
        let currentFuel = SimVar.GetSimVarValue("FUEL TOTAL QUANTITY", "gallons") * SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "pounds") / 1000;
        let currentFuelFlow = SimVar.GetSimVarValue("TURB ENG FUEL FLOW PPH:1", "pound per hour") + SimVar.GetSimVarValue("TURB ENG FUEL FLOW PPH:2", "pound per hour") + SimVar.GetSimVarValue("TURB ENG FUEL FLOW PPH:3", "pound per hour") + SimVar.GetSimVarValue("TURB ENG FUEL FLOW PPH:4", "pound per hour");
        currentFuelFlow = currentFuelFlow / 1000;
        let waypointActiveCell = "";
        let waypointActiveDistanceCell = "";
        let waypointActiveETACell = "";
        let waypointActiveFuelCell = "";
        let waypointActive = fmc.flightPlanManager.getActiveWaypoint();
        let waypointActiveDistance = NaN;
        if (waypointActive) {
            waypointActiveCell = waypointActive.ident;
            waypointActiveDistance = Avionics.Utils.computeGreatCircleDistance(planeCoordinates, waypointActive.infos.coordinates);
            if (isFinite(waypointActiveDistance)) {
                waypointActiveDistanceCell = waypointActiveDistance.toFixed(0) + " ";
                let eta = fmc.computeETA(waypointActiveDistance, speed, currentTime);
                if (isFinite(eta)) {
                    let etaHours = Math.floor(eta / 3600);
                    let etaMinutes = Math.floor((eta - etaHours * 3600) / 60);
                    waypointActiveETACell = etaHours.toFixed(0).padStart(2, "0") + etaMinutes.toFixed(0).padStart(2, "0");
                }
                let fuelLeft = fmc.computeFuelLeft(waypointActiveDistance, speed, currentFuel, currentFuelFlow);
                if (isFinite(fuelLeft)) {
                    waypointActiveFuelCell = fuelLeft.toFixed(0);
                }
            }
        }
        let waypointActiveNextCell = "";
        let waypointActiveNext;
        let waypointActiveNextDistanceCell = "";
        let waypointActiveNextETACell = "";
        let waypointActiveNextFuelCell = "";
        let waypointActiveNextDistance = NaN;
        if (fmc.flightPlanManager.getActiveWaypointIndex() != -1) {
            waypointActiveNext = fmc.flightPlanManager.getNextActiveWaypoint();
            if (waypointActiveNext) {
                waypointActiveNextCell = waypointActiveNext.ident;
                if (waypointActive && isFinite(waypointActiveDistance)) {
                    let d = Avionics.Utils.computeGreatCircleDistance(waypointActive.infos.coordinates, waypointActiveNext.infos.coordinates);
                    if (isFinite(d)) {
                        waypointActiveNextDistance = d + waypointActiveDistance;
                        waypointActiveNextDistanceCell = waypointActiveNextDistance.toFixed(0) + " ";
                        let eta = fmc.computeETA(waypointActiveNextDistance, speed, currentTime);
                        if (isFinite(eta)) {
                            let etaHours = Math.floor(eta / 3600);
                            let etaMinutes = Math.floor((eta - etaHours * 3600) / 60);
                            waypointActiveNextETACell = etaHours.toFixed(0).padStart(2, "0") + etaMinutes.toFixed(0).padStart(2, "0");
                        }
                        let fuelLeft = fmc.computeFuelLeft(waypointActiveNextDistance, speed, currentFuel, currentFuelFlow);
                        if (isFinite(fuelLeft)) {
                            waypointActiveNextFuelCell = fuelLeft.toFixed(0);
                        }
                    }
                }
            }
        }
        let destinationCell = "";
        let destination = fmc.flightPlanManager.getDestination();
        let destinationDistanceCell = "";
        let destinationETACell = "";
        let destinationFuelCell = "";
        let destinationDistance = NaN;
        if (destination) {
            destinationCell = destination.ident;
            destinationDistance = destination.cumulativeDistanceInFP;
            if (waypointActive) {
                destinationDistance -= waypointActive.distanceInFP;
                destinationDistance += fmc.flightPlanManager.getDistanceToActiveWaypoint();
                if (isFinite(destinationDistance)) {
                    destinationDistanceCell = destinationDistance.toFixed(0) + " ";
                    let eta = fmc.computeETA(destinationDistance, speed, currentTime);
                    if (isFinite(eta)) {
                        let etaHours = Math.floor(eta / 3600);
                        let etaMinutes = Math.floor((eta - etaHours * 3600) / 60);
                        destinationETACell = etaHours.toFixed(0).padStart(2, "0") + etaMinutes.toFixed(0).padStart(2, "0");
                    }
                    let fuelLeft = fmc.computeFuelLeft(destinationDistance, speed, currentFuel, currentFuelFlow);
                    if (isFinite(fuelLeft)) {
                        destinationFuelCell = fuelLeft.toFixed(0);
                    }
                }
            }
        }
        fmc.setTemplate([
            ["PROGRESS"],
            ["FROM", "FUEL", "ALT", "ATA"],
            [waypointFromCell, waypointFromFuelCell, waypointFromAltCell, waypointFromAtaCell],
            ["", "FUEL", "DTG", "ETA"],
            [waypointActiveCell, waypointActiveFuelCell, waypointActiveDistanceCell, waypointActiveETACell],
            [""],
            [waypointActiveNextCell, waypointActiveNextFuelCell, waypointActiveNextDistanceCell, waypointActiveNextETACell],
            [""],
            [destinationCell, destinationFuelCell, destinationDistanceCell, destinationETACell],
            ["TO T/D", "FUEL QTY"],
            [""],
            ["WIND"],
            ["", "NAV STATUS>"]
        ]);
    }
}
B787_10_FMC_ProgressPage._timer = 0;
//# sourceMappingURL=B787_10_FMC_ProgressPage.js.map