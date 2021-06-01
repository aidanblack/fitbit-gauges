import clock from "clock";
import document from "document";
import { me } from "appbit";
import { battery } from "power";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { today } from "user-activity";
import { goals } from "user-activity";
import * as weather from "fitbit-weather/app";

clock.granularity = "seconds";

const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");
const dateDay = document.getElementById("dateDay");
const dateMonth = document.getElementById("dateMonth");
const heartRate = document.getElementById("heartRate");
const batteryGauge = document.getElementById("battery");
const stepsGauge = document.getElementById("steps");
const distanceGauge = document.getElementById("distance");
const zoneGauge = document.getElementById("zone");
const batteryBackground = document.getElementById("batteryBackground");
const stepsBackground = document.getElementById("stepsBackground");
const distanceBackground = document.getElementById("distanceBackground");
const zoneBackground = document.getElementById("zoneBackground");
const weatherGradient = document.getElementById("gradient");
const weatherImage = document.getElementById("weatherImage");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const temperature = document.getElementById("temperature");

const body = null;
if (BodyPresenceSensor) {
  body = new BodyPresenceSensor();
  body.start();
}

const hrm;
var heartBeats = 0;
if (HeartRateSensor) {
    hrm = new HeartRateSensor();
    hrm.start();
    heartBeats = hrm.heartRate;

    hrm.addEventListener("reading", (evt) => {
        if (body.present) {
            hrm.start();
            heartBeats = hrm.heartRate;
            heartRate.text = heartBeats;
            heartRate.style.visibility = "visible";
        } else {
            hrm.stop();
            heartRate.style.visibility = "hidden";
        }
    });
}

clock.ontick = (evt) => {
    let now = evt.date;
    let dateText = now.toLocaleString('default', { month: 'short' }).substring(4, 10);

    dateMonth.groupTransform.rotate.angle = now.getMonth() * 30;
    if(now.getDate() == 31)
        dateDay.groupTransform.rotate.angle = 0;
    else
        dateDay.groupTransform.rotate.angle = ((now.getDate() - 1) * 12) + 6;

//    trip.text = dateText.toUpperCase();
    let hours = now.getHours();
    hours = hours % 12 || 12;
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    //hourHandShadow.groupTransform.rotate.angle = ((360 / 12) * hours) + ((360 / 12 / 60) * minutes);
    hourHand.groupTransform.rotate.angle = ((360 / 12) * hours) + ((360 / 12 / 60) * minutes);
    //minuteHandShadow.groupTransform.rotate.angle = (360 / 60) * minutes + ((360 / 60 / 60) * seconds);
    minuteHand.groupTransform.rotate.angle = (360 / 60) * minutes + ((360 / 60 / 60) * seconds);
    //secondHandShadow.groupTransform.rotate.angle = seconds * 6;
    secondHand.groupTransform.rotate.angle = seconds * 6;
    if (me.permissions.granted("access_activity")) updateStats();

    weather.fetch(30 * 60 * 1000) // return the cached value if it is less than 30 minutes old 
    .then(weather => processWeather(weather))
    .catch(error => console.log(JSON.stringify(error)));
}

function updateStats() {
    //     if (mode == modes.HeartRate) {
    //     meter.text = "H/B";
    //     currentCount = heartBeats;
    //     currentGoal = 220;
    // }

    var batteryCount = battery.chargeLevel;
    var batteryGoal = 100;
    batteryBackground.style.opacity = Math.min(Math.max((batteryCount / batteryGoal / 2) + 0.5, 0.4), 1);
    batteryGauge.groupTransform.rotate.angle = Math.min(-15 + ((batteryCount / batteryGoal) * 30), 12);

    var stepsCount = today.adjusted.steps;
    var stepsGoal = goals.steps;
    stepsBackground.style.opacity = Math.min(Math.max((stepsCount / stepsGoal / 2) + 0.5, 0.4), 1);
    stepsGauge.groupTransform.rotate.angle = Math.max(15 - ((stepsCount / stepsGoal) * 30), -12);

    var distanceCount = today.adjusted.distance / 16.09344;
    var distanceGoal = goals.distance / 16.09344;
    distanceBackground.style.opacity = Math.min(Math.max((distanceCount / distanceGoal / 2) + 0.5, 0.4), 1);
    distanceGauge.groupTransform.rotate.angle = Math.max(15 - ((distanceCount / distanceGoal) * 30), -12);

    var zoneCount = today.adjusted.activeZoneMinutes.total;
    var zoneGoal = goals.activeZoneMinutes.total;
    zoneBackground.style.opacity = Math.min(Math.max((zoneCount / zoneGoal / 2) + 0.5, 0.4), 1);
    zoneGauge.groupTransform.rotate.angle = Math.min(-15 + ((zoneCount / zoneGoal) * 30), 12);
}

function processWeather(weather) {
    var weatherResult = weather;

    var currentCount = Math.round(weatherResult.temperatureF);
    var currentGoal = 120;
    var weatherCode = weatherResult.conditionCode;
    var dayNight;
    if (weatherResult.timestamp > weatherResult.sunrise && weatherResult.timestamp < weatherResult.sunset) dayNight = "d";
    else dayNight = "n";
    weatherImage.href = `weather/${weatherCode}${dayNight}.png`;

    var today = new Date();
    var sunriseTime = new Date(weatherResult.sunrise);
    var sunsetTime = new Date(weatherResult.sunset);

    var nowHours = today.getHours();
    var nowMinutes = today.getMinutes()
    var sunriseHours = sunriseTime.getHours();
    var sunriseMinutes = sunriseTime.getMinutes();
    var sunsetHours = sunsetTime.getHours();
    var sunsetMinutes = sunsetTime.getMinutes();

    var nowAngle = ((360 / 24) * nowHours) + ((360 / 24 / 60) * nowMinutes)
    var sunriseAngle = ((360 / 24) * sunriseHours) + ((360 / 24 / 60) * sunriseMinutes);
    var sunsetAngle = ((360 / 24) * sunsetHours) + ((360 / 24 / 60) * sunsetMinutes);
    sunset.startAngle = 180 - sunriseAngle;
    sunset.sweepAngle = 360 - sunsetAngle + sunriseAngle;
    document.getElementById("weatherRotate").groupTransform.rotate.angle = 360 - nowAngle;
    document.getElementById("symbolRotate").groupTransform.rotate.angle = nowAngle;

    temperature.text = currentCount + "°";
}

Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}