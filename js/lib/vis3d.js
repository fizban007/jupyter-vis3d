import * as widgets from "@jupyter-widgets/base";
import "lodash";
import { ThreeCanvas } from "./three-canvas";

import "./style.css";

// See example.py for the kernel counterpart to this file.
function asciiDecode(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function readUint16LE(buffer) {
    var view = new DataView(buffer);
    var val = view.getUint8(0);
    val |= view.getUint8(1) << 8;
    return val;
}

function fromArrayBuffer(buf) {
    // Check the magic number
    //var buf = new ArrayBuffer(buf)
    //console.log(buf)

    var magic = asciiDecode(buf.slice(0, 6));
    if (magic.slice(1, 6) != "NUMPY") {
        throw new Error("unknown file type");
    }

    var version = new Uint8Array(buf.slice(6, 8)),
        headerLength = readUint16LE(buf.slice(8, 10)),
        headerStr = asciiDecode(buf.slice(10, 10 + headerLength));
    var offsetBytes = 10 + headerLength;
    //rest = buf.slice(10+headerLength);  XXX -- This makes a copy!!! https://www.khronos.org/registry/typedarray/specs/latest/#5

    var info = JSON.parse(
        headerStr
            .toLowerCase()
            .replace("(", "[")
            .replace(",),", "]")
            .replace("),", "]")
            .replace(/'/g, '"')
    );

    // Intepret the bytes according to the specified dtype
    var data;
    if (info.descr === "|u1") {
        data = new Uint8Array(buf, offsetBytes);
    } else if (info.descr === "|i1") {
        data = new Int8Array(buf, offsetBytes);
    } else if (info.descr === "<u2") {
        data = new Uint16Array(buf, offsetBytes);
    } else if (info.descr === "<i2") {
        data = new Int16Array(buf, offsetBytes);
    } else if (info.descr === "<u4") {
        data = new Uint32Array(buf, offsetBytes);
    } else if (info.descr === "<i4") {
        data = new Int32Array(buf, offsetBytes);
    } else if (info.descr === "<i8") {
        data = new BigInt64Array(buf, offsetBytes);
    } else if (info.descr === "<f4") {
        data = new Float32Array(buf, offsetBytes);
    } else if (info.descr === "<f8") {
        data = new Float64Array(buf, offsetBytes);
    } else {
        throw new Error("unknown numeric dtype");
    }

    return {
        shape: info.shape,
        fortran_order: info.fortran_order,
        data: data,
        get: function (x, y) {
            if (this.shape.length == 2) return this.data[x * this.shape[0] + y];
            if (this.shape.length == 1) return this.data[x];
        },
        dim: function () {
            return this.shape.length;
        },
    };
}

// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
var VisModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name: "VisModel",
        _view_name: "VisView",
        _model_module: "jupyter-vis3d",
        _view_module: "jupyter-vis3d",
        _model_module_version: "0.1.0",
        _view_module_version: "0.1.0",
        height: 600,
        bg_color: "#000000",
        color: 0x00ff00,
        enable_stats: true,
        volume_bytes: 0,
        commands: [],
    }),
});

// Custom View. Renders the widget model.
var VisView = widgets.DOMWidgetView.extend({
    initialize: function () {
        this.model.on("change:volume_bytes", this.process_volume_bytes, this);
        this.process_volume_bytes();

        // this.model.on("change:commands", this.handle_commands, this);
        this.listenTo(this.model, "msg:custom", function () {
            var response = arguments[0];
            console.log(response);
            if (response == "handle_commands") {
                this.handle_commands();
            } else if (response == "clear") {
                this.canvas.clear();
            }
        });
    },

    handle_commands: function () {
        var commands = this.model.get("commands");
        console.log(commands);
        
        if (commands.length > 1) {
            while (commands.length > 0) {
                const response = commands.pop();
                if (response == {}) {
                } else if (response.type == "sphere") {
                    this.canvas.draw_sphere(
                        response.pos,
                        response.radius,
                        response.color
                    );
                } else if (response.type == "cube") {
                    this.canvas.draw_cube(
                        response.pos,
                        response.size,
                        response.color
                    );
                }
            }
            this.model.set("commands", [{}]);
            this.model.save_changes();
        }
    },

    process_volume_bytes: function () {
        var arr = fromArrayBuffer(this.model.get("volume_bytes").buffer);
        console.log(arr.shape, arr.data);
    },

    // Defines how the widget gets rendered into the DOM
    render: function () {
        // console.log(this.el);
        // var width = this.el.parentElement.offsetWidth;
        var width = 900;
        const output_element = document.querySelector(".output_subarea");
        if (output_element) {
            width = output_element.offsetWidth;
        }
        const height = this.model.get("height");

        var container = document.createElement("div");
        container.id = "three-container";
        container.style.width = width + "px";
        container.style.height = height + "px";
        this.el.appendChild(container);

        var bg_color = this.model.get("bg_color");
        this.canvas = new ThreeCanvas(container, bg_color);
        this.stats_changed();

        // Observe changes in the value traitlet in Python, and define
        // a custom callback.
        this.model.on("change:enable_stats", this.stats_changed, this);

        var fsHandler = function () {
            if (
                document.webkitIsFullScreen ||
                document.mozFullScreen ||
                document.msFullscreenElement !== undefined
            ) {
                /* Run code when going to fs mode */
            } else {
                container.style.height = height + "px";
            }
        };

        if (document.addEventListener) {
            document.addEventListener(
                "webkitfullscreenchange",
                fsHandler,
                false
            );
            document.addEventListener("mozfullscreenchange", fsHandler, false);
            document.addEventListener("fullscreenchange", fsHandler, false);
            document.addEventListener("MSFullscreenChange", fsHandler, false);
        }

        this.handle_commands();
    },

    stats_changed: function () {
        var is_enabled = this.model.get("enable_stats");
        this.canvas.toggle_stats(is_enabled);
    },
});

export { VisModel, VisView };
