/*
 Spacecraft.js simulates a small spacecraft generating telemetry.
*/

function Spacecraft() {
    this.state = {
        "prop.fuel": 77,
        "prop.thrusters": "OFF",
        "comms.recd": 0,
        "comms.sent": 0,
        "temp": 245,
        "loc": 3000,
        "sens": 150
    };
    this.history = {};
    this.listeners = [];
    Object.keys(this.state).forEach(function (k) {
        this.history[k] = [];
    }, this);

    setInterval(function () {
        this.updateState();
        this.generateTelemetry();
    }.bind(this), 1000);

    console.log("Example spacecraft launched!");
    console.log("Press Enter to toggle thruster state.");

    process.stdin.on('data', function () {
        this.state['prop.thrusters'] =
            (this.state['prop.thrusters'] === "OFF") ? "ON" : "OFF";
        this.state['comms.recd'] += 32;
        console.log("Thrusters " + this.state["prop.thrusters"]);
        this.generateTelemetry();
    }.bind(this));
};

Spacecraft.prototype.updateState = function () {
    this.state["prop.fuel"] = Math.max(
        0,
        this.state["prop.fuel"] -
        (this.state["prop.thrusters"] === "ON" ? 0.5 : 0)
    );
    this.state["sens"] = this.state["sens"] * 0.985
        + Math.random() * 0.25 + Math.sin(Date.now());
    if (this.state["prop.thrusters"] === "ON") {
        this.state["loc"] = 8.15;
    } else {
        this.state["loc"] = this.state["loc"] * 0.985;
    }
    this.state["temp"] = 150 + Math.pow(Math.random(), 3);
};

/**
 * Takes a measurement of spacecraft state, stores in history, and notifies
 * listeners.
 */
Spacecraft.prototype.generateTelemetry = function () {
    var timestamp = Date.now(), sent = 0;
    Object.keys(this.state).forEach(function (id) {
        var state = { timestamp: timestamp, value: this.state[id], id: id};
        this.notify(state);
        this.history[id].push(state);
        this.state["comms.sent"] += JSON.stringify(state).length;
    }, this);
};

Spacecraft.prototype.notify = function (point) {
    this.listeners.forEach(function (l) {
        l(point);
    });
};

Spacecraft.prototype.listen = function (listener) {
    this.listeners.push(listener);
    return function () {
        this.listeners = this.listeners.filter(function (l) {
            return l !== listener;
        });
    }.bind(this);
};

module.exports = function () {
    return new Spacecraft()
};

