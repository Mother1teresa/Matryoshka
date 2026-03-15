import {
  Fragment,
  computed,
  createBaseVNode,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createVNode,
  defineComponent,
  getCurrentScope,
  guardReactiveProps,
  h,
  inject,
  isRef,
  mergeProps,
  nextTick,
  normalizeClass,
  normalizeProps,
  normalizeStyle,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  openBlock,
  provide,
  ref,
  renderList,
  renderSlot,
  resolveDynamicComponent,
  shallowRef,
  toRaw,
  toRef,
  toValue,
  triggerRef,
  unref,
  useSlots,
  vShow,
  watch,
  withCtx,
  withDirectives
} from "./chunk-ZETSIBQN.js";
import "./chunk-BUSYA2B4.js";

// node_modules/vue-yandex-maps/dist/vue-yandex-maps-BbbIDD3A.js
var yandexMapSettings = safeRef({
  apikey: ""
});
var isYandexMapReadyToInit = safeComputed(() => !!yandexMapSettings.value.apikey);
var yandexMapYmaps3 = () => ymaps3;
var yandexMapScript = shallowRef(null);
var YandexMapException = class extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = "YandexMapException";
  }
};
var yandexMapLoadStatus = safeRef("pending");
var yandexMapIsLoaded = safeComputed(() => yandexMapLoadStatus.value === "loaded" || yandexMapLoadStatus.value === "error");
var yandexMapLoadError = safeRef(null);
function importLayersExtra() {
  return ymaps3.import("@yandex/ymaps3-layers-extra");
}
function safeRef(value) {
  if (typeof window === "undefined") {
    return {
      // @ts-expect-error SSR workaround
      value,
      __v_isRef: true
    };
  }
  return ref(value);
}
function safeComputed(getter, debugOptions) {
  if (typeof window === "undefined") {
    return {
      get value() {
        return getter();
      },
      // @ts-expect-error SSR workaround
      __v_isRef: true
    };
  }
  return computed(getter, debugOptions);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function copy(target) {
  target = toRaw(unref(target));
  if (Array.isArray(target)) return target.map((i) => copy(i));
  if (!target || typeof target !== "object" || target?.constructor !== void 0 && target?.constructor !== Object) return target;
  return Object.keys(target).reduce((carry, key) => {
    const val = target[key];
    carry[key] = copy(val);
    return carry;
  }, {});
}
function isDev() {
  return typeof process !== "undefined" && true;
}
function getException({
  text,
  isInternal,
  warn
}) {
  if (warn) {
    text = `Warning: ${text}`;
  }
  if (isInternal) {
    text += " This is likely Vue Yandex Maps internal bug.";
    if (isDev()) {
      text += " You can report this bug here: https://github.com/yandex-maps-unofficial/vue-yandex-maps/issues/new/choose";
    }
  }
  return new YandexMapException(text);
}
function throwException(settings) {
  const exception = getException(settings);
  if (settings.warn) {
    console.warn(exception);
  } else {
    throw exception;
  }
}
function excludeKeys(item, ignoreKeys) {
  for (const [key, value] of Object.entries(item)) {
    if (ignoreKeys.includes(key)) delete item[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      excludeKeys(value, ignoreKeys);
      if (!Object.keys(value).length) delete item[key];
    }
  }
}
function hF(children, props) {
  return h(Fragment, props, children);
}
var allowedOptionsKeys = {
  apikey: true,
  servicesApikeys: true,
  lang: true,
  initializeOn: true,
  importModules: true,
  version: true,
  strictMode: true,
  domain: true,
  mapsRenderWaitDuration: true,
  mapsScriptWaitDuration: true,
  scriptAttributes: true,
  scriptURLParameters: true,
  cdnLibraryLoading: true
};
function initYmaps() {
  return new Promise((res, rej) => {
    if (typeof ymaps3 !== "undefined") {
      if (yandexMapLoadStatus.value !== "loaded") yandexMapLoadStatus.value = "loaded";
      return res();
    }
    if (typeof window === "undefined") return rej(new YandexMapException("You must call initYmaps on Client Side only"));
    if (yandexMapLoadStatus.value === "loading") {
      const watcher = watch(yandexMapLoadStatus, (val) => {
        if (!yandexMapIsLoaded.value) return;
        watcher();
        if (val === "error") rej(yandexMapLoadError);
        if (val === "loaded") res();
      }, {
        immediate: true
      });
      return;
    }
    yandexMapLoadStatus.value = "loading";
    const settings = yandexMapSettings.value;
    if (!settings.apikey) {
      throwException({
        text: "apikey was not set for Yandex Maps initialization. Ensure you have attached needed plugins or called createYmapsOptions with apikey. If you need delayed init, please use isYandexMapReadyToInit computed as v-if."
      });
    }
    const script = document.createElement("SCRIPT");
    yandexMapScript.value = script;
    const url = new URL(`${settings.domain}/${settings.version}/`);
    for (const key in settings.scriptURLParameters) {
      url.searchParams.set(key, settings.scriptURLParameters[key]);
    }
    url.searchParams.set("lang", settings.lang || "ru_RU");
    url.searchParams.set("apikey", settings.apikey);
    const scriptAttributes = {
      async: "",
      defer: "",
      referrerpolicy: "strict-origin-when-cross-origin",
      type: "text/javascript",
      id: "vue-yandex-maps",
      src: url.toString(),
      ...settings.scriptAttributes || {}
    };
    for (const key in scriptAttributes) {
      if (scriptAttributes[key] === false) continue;
      script.setAttribute(key, scriptAttributes[key]);
    }
    document.head.appendChild(script);
    script.onload = async () => {
      try {
        await yandexMapYmaps3().ready;
        if (settings.servicesApikeys && Object.keys(settings.servicesApikeys).length > 0) {
          yandexMapYmaps3().getDefaultConfig().setApikeys(settings.servicesApikeys);
        }
        if (typeof settings.strictMode === "boolean") yandexMapYmaps3().strictMode = settings.strictMode;
        if (settings.importModules) {
          await Promise.all(
            settings.importModules.map(
              (module) => yandexMapYmaps3().import(module)
            )
          );
        }
        if (settings.cdnLibraryLoading?.enabled !== false) {
          yandexMapYmaps3().import.registerCdn(settings.cdnLibraryLoading?.url || "https://cdn.jsdelivr.net/npm/{package}", [
            ...[
              "@yandex/ymaps3-default-ui-theme@latest",
              "@yandex/ymaps3-resizer@latest",
              "@yandex/ymaps3-minimap@latest",
              "@yandex/ymaps3-context-menu@latest",
              "@yandex/ymaps3-drawer-control@latest",
              "@yandex/ymaps3-signpost@latest",
              "@yandex/ymaps3-spinner@latest",
              "@yandex/ymaps3-world-utils@latest",
              "@yandex/ymaps3-web-mercator-projection@latest",
              "@yandex/ymaps3-cartesian-projection@latest",
              "@yandex/ymaps3-hint@latest",
              "@yandex/ymaps3-clusterer@latest"
            ].filter((x) => !(settings.cdnLibraryLoading?.extendLibraries ?? []).some((y) => {
              if (!y.startsWith("@yandex")) return false;
              return y.split("@")[1] === x.split("@")[1];
            })),
            ...settings.cdnLibraryLoading?.extendLibraries ?? []
          ]);
        }
        yandexMapLoadStatus.value = "loaded";
        res();
      } catch (e) {
        yandexMapLoadStatus.value = "error";
        yandexMapLoadError.value = e;
        rej(e);
      }
    };
    script.onerror = (e) => {
      yandexMapLoadError.value = e;
      rej(e);
    };
  });
}
function createYmapsOptions(options, ignoreNoCurrentInstance = false) {
  if (isYandexMapReadyToInit.value) return yandexMapSettings.value;
  const optionsShallowClone = {
    lang: "ru_RU",
    initializeOn: "onComponentMount",
    importModules: [],
    version: "v3",
    strictMode: false,
    domain: "https://api-maps.yandex.ru",
    mapsRenderWaitDuration: true,
    mapsScriptWaitDuration: true,
    servicesApikeys: null,
    scriptAttributes: {},
    scriptURLParameters: {},
    cdnLibraryLoading: {},
    ...options
  };
  if (!optionsShallowClone.apikey) {
    throwException({
      text: "You must specify apikey for createYmapsOptions"
    });
  }
  const notAllowedKeys = Object.keys(optionsShallowClone).filter((key) => !(key in allowedOptionsKeys));
  if (notAllowedKeys.length && !notAllowedKeys.every((x) => x === "typesInjection")) {
    throwException({
      text: `You have passed unknown keys to createYmapsOptions: ${notAllowedKeys.join(", ")}. Only ${Object.keys(allowedOptionsKeys).join(", ")} are allowed.`
    });
  }
  if (typeof window === "undefined") return optionsShallowClone;
  yandexMapSettings.value = optionsShallowClone;
  return optionsShallowClone;
}
function importYmapsCDNModule(module) {
  return ymaps3.import(module);
}

// node_modules/vue-yandex-maps/dist/vue-yandex-maps.js
import "C:/Users/Sofia/Desktop/frontend/node_modules/vue-yandex-maps/dist/vue-yandex-maps.css";
function applyModifier(coords, modifier) {
  const result = {
    x: 0,
    y: 0
  };
  result.x = coords.x * modifier;
  result.y = coords.y * modifier;
  return result;
}
function applyFunctionModifier(coords, functionModifier) {
  const result = {
    x: 0,
    y: 0
  };
  result.x = functionModifier(coords.x, 1);
  result.y = functionModifier(coords.y, 2);
  return result;
}
function worldToPixels$1(coords, modifier) {
  const i = 2 ** modifier / 2 * 256;
  return applyModifier({
    x: coords.x + 1,
    y: 1 - coords.y
  }, i);
}
function convertWorldCoordinates(projection, coordinates, modifier) {
  const worldCoordinates = projection.toWorldCoordinates(coordinates);
  return worldToPixels$1(worldCoordinates, modifier);
}
function pixelsToWorld$1(coords, modifier) {
  const i = 2 ** modifier / 2 * 256;
  return {
    x: coords.x / i - 1,
    y: 1 - coords.y / i
  };
}
function findNeededValue(t, e, i) {
  return Math.max(Math.min(t, i), e);
}
function worldCoordsFromModifier(projection, coords, modifier) {
  const resultCoords = applyFunctionModifier(pixelsToWorld$1(coords, modifier), ((value) => findNeededValue(value, -1, 1 - 1e-15)));
  return projection.fromWorldCoordinates(resultCoords);
}
function convertBounds(projection, bounds, modifier) {
  const topLeft = convertWorldCoordinates(projection, bounds[0], modifier);
  const bottomRight = convertWorldCoordinates(projection, bounds[1], modifier);
  const modified = 2 ** modifier * 256;
  const updatedBounds = [[topLeft.x, topLeft.y], [bottomRight.x, bottomRight.y]];
  if (topLeft.x > bottomRight.x) {
    updatedBounds[0][0] = topLeft.x;
    updatedBounds[1][0] = bottomRight.x + modified;
  }
  if (topLeft.y > bottomRight.y) {
    updatedBounds[0][1] = bottomRight.y;
    updatedBounds[1][1] = topLeft.y;
  }
  return updatedBounds;
}
function applyMarginToCoords(coords, margin) {
  return {
    x: Math.max(coords.x - (margin ? margin[1] + margin[3] : 0), 1),
    y: Math.max(coords.y - (margin ? margin[0] + margin[2] : 0), 1)
  };
}
function findZoom(projection, bounds, coords, isSnap, zoomRange) {
  const [[topLeftFirst, topLeftSecond], [bottomRightFirst, bottomRightSecond]] = convertBounds(projection, bounds, 0);
  const firstCalc = Math.max(Math.abs(bottomRightFirst - topLeftFirst), 1e-10);
  const secondCalc = Math.max(Math.abs(bottomRightSecond - topLeftSecond), 1e-10);
  const zoom = findNeededValue(Math.min(Math.log2(coords.x / firstCalc), Math.log2(coords.y / secondCalc)), zoomRange.min, zoomRange.max);
  return isSnap ? Math.floor(zoom + 1e-6) : zoom;
}
function findCenter(projection, bounds, zoom) {
  const [[topLeftFirst, topLeftSecond], [bottomRightFirst, bottomRightSecond]] = convertBounds(projection, bounds, zoom);
  return worldCoordsFromModifier(projection, {
    x: (topLeftFirst + bottomRightFirst) / 2,
    y: (topLeftSecond + bottomRightSecond) / 2
  }, zoom);
}
async function getLocationFromBounds({
  bounds,
  map,
  roundZoom,
  comfortZoomLevel
}) {
  const ctxMap = Object.keys(map).find((x) => x.endsWith("CtxMap"));
  if (!ctxMap) {
    throwException({
      text: "CtxMap was not found in useYMapsGetCenterAndZoomFromBounds",
      isInternal: true
    });
  }
  const ctx = map[ctxMap];
  const mapZoom = map.zoom;
  const ctxItem = await new Promise((resolve, reject) => {
    ctx.forEach((item, { name }) => {
      if (name !== "map") return;
      resolve(item);
    });
    reject(getException({
      text: "Map item was not found in useYMapsGetCenterAndZoomFromBounds",
      isInternal: true
    }));
  });
  const ctxItemMapKey = Object.keys(ctxItem).find((x) => x.endsWith("_context"));
  if (!ctxItemMapKey) {
    throwException({
      text: "CtxMapKey was not found in useYMapsGetCenterAndZoomFromBounds",
      isInternal: true
    });
  }
  const ctxItemMap = ctxItem[ctxItemMapKey].map;
  const projection = ctxItemMap.projection;
  const size = ctxItemMap.size;
  const margin = ctxItemMap.margin;
  const isSnap = ctxItemMap.effectiveZoomRounding === "snap";
  const zoomRange = ctxItemMap.zoomRange;
  let zoom = findZoom(projection, bounds, applyMarginToCoords(size, margin), isSnap, zoomRange);
  const center = findCenter(projection, bounds, zoom);
  if (roundZoom || comfortZoomLevel) {
    const originalZoom = zoom;
    let roundedZoom = Math[typeof roundZoom === "string" ? roundZoom : "floor"](zoom);
    if (roundZoom) zoom = roundedZoom;
    if (comfortZoomLevel) {
      const userSettings = typeof comfortZoomLevel === "object" ? comfortZoomLevel : {};
      if (userSettings.roundStrategy) roundedZoom = Math[userSettings.roundStrategy](originalZoom);
      const diff2 = originalZoom - roundedZoom;
      const settings = {
        diff: 0.5,
        correction: 1,
        ...userSettings
      };
      if (diff2 < settings.diff) {
        zoom -= settings.correction;
      }
      if (zoom <= mapZoom) {
        zoom = originalZoom;
      }
    }
  }
  return {
    zoom,
    center
  };
}
function getCenterFromCoords(coordinates) {
  if (coordinates.length === 1) return coordinates[0];
  if (!coordinates.length) {
    throwException({
      text: "Invalid parameters in getCenterFromCoords: you must pass at least one LngLat"
    });
  }
  const sum = coordinates.reduce(([accLng, accLat], [lng, lat]) => [
    accLng + lng,
    accLat + lat
  ], [0, 0]);
  return [
    sum[0] / coordinates.length,
    sum[1] / coordinates.length
  ];
}
function getBoundsFromCoords(coordinates) {
  if (coordinates.length < 2) {
    throwException({
      text: "Invalid parameters in getBoundsFromCoords: you must pass at least two LngLat"
    });
  }
  const {
    minLongitude,
    minLatitude,
    maxLongitude,
    maxLatitude
  } = coordinates.reduce(
    (acc, [longitude, latitude]) => ({
      minLongitude: Math.min(acc.minLongitude, longitude),
      minLatitude: Math.min(acc.minLatitude, latitude),
      maxLongitude: Math.max(acc.maxLongitude, longitude),
      maxLatitude: Math.max(acc.maxLatitude, latitude)
    }),
    {
      minLongitude: Infinity,
      minLatitude: Infinity,
      maxLongitude: -Infinity,
      maxLatitude: -Infinity
    }
  );
  return [[minLongitude, minLatitude], [maxLongitude, maxLatitude]];
}
async function worldToPixels(...args) {
  return (await importYmapsCDNModule("@yandex/ymaps3-world-utils")).worldToPixels(...args);
}
async function pixelsToWorld(...args) {
  return (await importYmapsCDNModule("@yandex/ymaps3-world-utils")).pixelsToWorld(...args);
}
async function WebMercator() {
  return (await importYmapsCDNModule("@yandex/ymaps3-web-mercator-projection")).WebMercator;
}
async function Cartesian() {
  return (await importYmapsCDNModule("@yandex/ymaps3-cartesian-projection")).Cartesian;
}
function createYmaps(settings) {
  return {
    install(app) {
      createYmapsOptions(settings);
      if (settings.initializeOn === "onPluginInit") {
        initYmaps().catch(console.error);
      }
    }
  };
}
var isDate = (d) => d instanceof Date;
var isEmpty = (o) => Object.keys(o).length === 0;
var isObject = (o) => o != null && typeof o === "object";
var hasOwnProperty = (o, ...args) => Object.prototype.hasOwnProperty.call(o, ...args);
var isEmptyObject = (o) => isObject(o) && isEmpty(o);
var makeObjectWithoutPrototype = () => /* @__PURE__ */ Object.create(null);
var diff = (lhs, rhs) => {
  if (lhs === rhs) return {};
  if (!isObject(lhs) || !isObject(rhs)) return rhs;
  const deletedValues = Object.keys(lhs).reduce((acc, key) => {
    if (!hasOwnProperty(rhs, key)) {
      acc[key] = void 0;
    }
    return acc;
  }, makeObjectWithoutPrototype());
  if (isDate(lhs) || isDate(rhs)) {
    if (lhs.valueOf() == rhs.valueOf()) return {};
    return rhs;
  }
  return Object.keys(rhs).reduce((acc, key) => {
    if (!hasOwnProperty(lhs, key)) {
      acc[key] = rhs[key];
      return acc;
    }
    const difference = diff(lhs[key], rhs[key]);
    if (isEmptyObject(difference) && !isDate(difference) && (isEmptyObject(lhs[key]) || !isEmptyObject(rhs[key])))
      return acc;
    acc[key] = difference;
    return acc;
  }, deletedValues);
};
function injectMap() {
  if (!getCurrentScope()) {
    throwException({
      text: "injectMap must be only called on runtime.",
      isInternal: true
    });
  }
  const map = inject("map");
  if (!map || !isRef(map)) {
    throwException({
      text: "Was not able to inject valid map in injectMap.",
      isInternal: true
    });
  }
  return map;
}
function injectLayers() {
  if (!getCurrentScope()) {
    throwException({
      text: "injectLayers must be only called on runtime.",
      isInternal: true
    });
  }
  const layers = inject("layers");
  if (!layers || !isRef(layers)) {
    throwException({
      text: "Was not able to inject valid layers in injectLayers.",
      isInternal: true
    });
  }
  return layers;
}
async function waitTillYmapInit({
  timeoutCallback,
  waitDuration
} = {}) {
  if (typeof window === "undefined") {
    throwException({
      text: "waitTillYmapInit cannot be called on SSR.",
      isInternal: true
    });
  }
  if (typeof ymaps3 !== "undefined") return;
  return new Promise((resolve, reject) => {
    if (typeof ymaps3 === "undefined") {
      let timeout;
      waitDuration = typeof waitDuration !== "undefined" ? waitDuration : yandexMapSettings.value.mapsScriptWaitDuration;
      if (waitDuration !== false) {
        timeout = setTimeout(() => {
          timeoutCallback?.(timeout, true);
          reject(new YandexMapException("Was not able to wait for map initialization in waitTillYmapInit. Ensure that map was initialized. You can change this behavior by using mapsScriptWaitDuration."));
        }, typeof waitDuration === "number" ? waitDuration : 5e3);
        timeoutCallback?.(timeout, false);
      }
      watch(yandexMapIsLoaded, () => {
        if (timeout) {
          clearTimeout(timeout);
          timeoutCallback?.(timeout, true);
        }
        if (yandexMapLoadStatus.value === "loaded") {
          resolve();
        } else {
          reject(yandexMapLoadError);
        }
      }, {
        immediate: true
      });
    } else {
      resolve();
    }
  });
}
async function waitTillMapInit({
  map: _map,
  timeoutCallback,
  waitDuration
} = {}) {
  if (!_map && !getCurrentScope()) {
    throwException({
      text: "onMapInit must be only called on runtime.",
      isInternal: true
    });
  }
  if (typeof window === "undefined") {
    throwException({
      text: "waitTillMapInit cannot be called on SSR.",
      isInternal: true
    });
  }
  const map = _map || injectMap();
  if (map.value) return;
  return new Promise((resolve, reject) => {
    let timeout;
    waitDuration = typeof waitDuration !== "undefined" ? waitDuration : yandexMapSettings.value.mapsRenderWaitDuration;
    if (waitDuration !== false) {
      timeout = setTimeout(() => {
        timeoutCallback?.(timeout, true);
        reject(new YandexMapException("Was not able to wait for map initialization in waitTillMapInit. You can change this behavior by using mapsRenderWaitDuration."));
      }, typeof waitDuration === "number" ? waitDuration : 5e3);
      timeoutCallback?.(timeout, false);
    }
    let watcher;
    watcher = watch(map, () => {
      if (map.value) {
        watcher?.();
        if (timeout) {
          clearTimeout(timeout);
          timeoutCallback?.(timeout, true);
        }
        resolve();
      }
    }, {
      immediate: true
    });
  });
}
function deleteMapChildren({
  children,
  isMercator,
  root
}) {
  if (!root) {
    throwException({
      text: "Failed to execute deleteMapChild due to destroyed root",
      isInternal: true
    });
  }
  if (children && !isMercator) {
    if (typeof root?.value === "object" && Array.isArray(root.value)) {
      root.value = root.value.filter((x) => x !== children);
    } else {
      root.value?.removeChild(children);
    }
  } else if (root.value && children && isMercator && "update" in root.value) {
    root.value.update({
      projection: void 0
    });
  }
}
var _hoisted_1$2 = {
  key: 0,
  class: "__ymap_slots"
};
var _sfc_main$H = defineComponent({
  ...{ name: "YandexMap" },
  __name: "YandexMap",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    tag: {
      type: String,
      default: "div"
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "100%"
    },
    // z-index for Map Container. Without this, elements of the map will be displayed under your site's elements due to high z-index inside of them
    zIndex: {
      type: Number,
      default: 0
    },
    /**
    * @description Settings for cart initialization.,
    *
    * You can modify this object or use map methods, such as setLocation/setBehaviors e.t.c.
    * @see https://yandex.ru/dev/maps/jsapi/doc/3.0/dg/concepts/map.html#map-parms
    * @see https://yandex.com/dev/maps/jsapi/doc/3.0/dg/concepts/map.html#map-parms
    */
    settings: {
      type: Object,
      required: true
    },
    /**
    * @description Makes settings readonly. Enable this if reactivity causes problems
    */
    readonlySettings: {
      type: Boolean,
      default: false
    },
    /**
    * @description Always inserts actual user center or bounds (based on your input) on every location change
    * @note This prop will cause user location change on every settings update (if user did move since last time). Use it with caution.
    */
    realSettingsLocation: {
      type: Boolean,
      default: false
    },
    /**
    * @description You can also add layers through <yandex-*> components
    *
    * Modifying this object after mount will cause no effect.
    *
    * Instead, please use map methods, such as addChild.
    * @see https://yandex.ru/dev/maps/jsapi/doc/3.0/dg/concepts/map.html#layers
    * @see https://yandex.com/dev/maps/jsapi/doc/3.0/dg/concepts/map.html#layers
    */
    layers: {
      type: Array,
      default: (() => [])
    },
    /**
    * @description Adds cursor: grab/grabbing to ymaps scheme layer
    */
    cursorGrab: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const map = shallowRef(null);
    const mapRef = shallowRef(null);
    const mapLayers = shallowRef([]);
    const projection = shallowRef(null);
    const ymapContainer = shallowRef(null);
    const mounted = shallowRef(false);
    const needsToHold = ref(0);
    provide("map", map);
    provide("layers", mapLayers);
    provide("projection", projection);
    provide("needsToHold", needsToHold);
    const getSettings = computed(() => ({
      ...props.settings,
      projection: void 0
    }));
    const init = async () => {
      if (!props.settings.location) {
        throwException({
          text: "You must specify location in YandexMap settings"
        });
      }
      if (map.value) map.value.destroy();
      const container = ymapContainer.value;
      if (!container) return;
      const settings = getSettings.value;
      if (projection.value) settings.projection = projection.value;
      map.value = new ymaps3.YMap(container, settings, [
        ...mapLayers.value,
        ...props.layers
      ]);
      emit("update:modelValue", map.value);
    };
    let listener;
    let watcher;
    let cursorGrabTimeout = null;
    async function setupCursorGrab() {
      await waitTillMapInit({
        map,
        timeoutCallback: (_timeout, isDelete) => {
          if (isDelete) {
            cursorGrabTimeout = null;
          } else {
            cursorGrabTimeout = _timeout;
          }
        }
      }).catch(() => {
      });
      if (!map.value) return;
      if (props.cursorGrab) {
        listener = new ymaps3.YMapListener({
          onActionStart: (e) => {
            if (e.type === "drag" && props.cursorGrab) mapRef.value?.classList.add("__ymap--grabbing");
          },
          onActionEnd: (e) => {
            if (e.type === "drag") mapRef.value?.classList.remove("__ymap--grabbing");
          }
        });
        map.value.addChild(listener);
      } else if (listener) map.value.removeChild(listener);
    }
    let reInit = false;
    watch(yandexMapLoadStatus, async (val) => {
      if (val === "pending") {
        reInit = true;
        mounted.value = false;
        return;
      }
      if (val !== "loaded" && !reInit) return;
      mounted.value = true;
      await nextTick();
      if (needsToHold.value) {
        await new Promise((resolve) => watch(needsToHold, () => {
          if (!needsToHold.value) resolve();
        }, {
          immediate: true
        }));
      }
      await init();
    });
    onMounted(async () => {
      if (yandexMapIsLoaded.value && !yandexMapScript?.value?.parentElement) {
        yandexMapLoadStatus.value = "pending";
        yandexMapScript.value?.remove();
        yandexMapScript.value = null;
        for (const key in window) {
          if (key.includes("ymaps3")) delete window[key];
        }
      }
      const setupWatcher = () => {
        watcher?.();
        let settings = copy(getSettings);
        watcher = watch(getSettings, (val) => {
          if (!map.value) return;
          const clonedSettings = copy(val);
          if (props.realSettingsLocation && clonedSettings.location) {
            if ("center" in clonedSettings.location && "center" in settings.location) {
              settings.location.center = map.value.center;
            } else if ("bounds" in clonedSettings.location && "bounds" in settings.location) {
              settings.location.bounds = map.value.bounds;
            }
            if ("zoom" in clonedSettings.location && "zoom" in settings.location) settings.location.zoom = map.value.zoom;
          }
          const settingsDiff = Object.keys(diff(settings, clonedSettings));
          if (settingsDiff.length === 0) return;
          const updatedSettings = { ...clonedSettings };
          for (const key in updatedSettings) {
            if (!settingsDiff.includes(key)) delete updatedSettings[key];
          }
          settings = clonedSettings;
          map.value?.update(updatedSettings);
        }, {
          deep: true
        });
      };
      if (!props.readonlySettings) {
        setupWatcher();
      }
      watch(() => props.readonlySettings, (val) => {
        if (!val) {
          watcher?.();
        } else {
          setupWatcher();
        }
      });
      watch(() => props.cursorGrab, setupCursorGrab, { immediate: true });
      if (!yandexMapIsLoaded.value) {
        if (yandexMapSettings.value.initializeOn === "onComponentMount") {
          try {
            await initYmaps();
          } catch (e) {
            console.error("An error occured while initializing Yandex Map with onComponentMount setting");
            console.error(e);
            return;
          }
        } else if (yandexMapLoadStatus.value === "loading" || yandexMapSettings.value.initializeOn === "onPluginInit") {
          if (yandexMapSettings.value.initializeOn === "onPluginInit" && yandexMapLoadStatus.value !== "loading") await nextTick();
          await initYmaps();
        }
        if (!yandexMapIsLoaded.value) {
          throwException({
            text: "You have set up <yandex-map> component without initializing Yandex maps. Please check initializeOn setting or call initYmaps manually before registering this component."
          });
        }
      }
      mounted.value = true;
      await nextTick();
      if (needsToHold.value) {
        await new Promise((resolve) => watch(needsToHold, () => {
          if (!needsToHold.value) resolve();
        }, {
          immediate: true
        }));
      }
      await init();
    });
    onBeforeUnmount(() => {
      if (cursorGrabTimeout) clearTimeout(cursorGrabTimeout);
      if (map.value) map.value.destroy();
      map.value = null;
      emit("update:modelValue", map.value);
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(__props.tag), {
        ref_key: "mapRef",
        ref: mapRef,
        class: normalizeClass(["__ymap", { "__ymap--grab": __props.cursorGrab }]),
        style: normalizeStyle({ width: __props.width, height: __props.height, zIndex: __props.zIndex.toString() })
      }, {
        default: withCtx(() => [
          createBaseVNode("div", {
            ref_key: "ymapContainer",
            ref: ymapContainer,
            class: "__ymap_container"
          }, null, 512),
          mounted.value ? withDirectives((openBlock(), createElementBlock("div", _hoisted_1$2, [
            renderSlot(_ctx.$slots, "default")
          ], 512)), [
            [vShow, false]
          ]) : createCommentVNode("", true)
        ]),
        _: 3
      }, 8, ["class", "style"]);
    };
  }
});
function provideMapRoot({ mapRootRef } = {}) {
  const children = mapRootRef ?? shallowRef();
  provide("mapRoot", children);
  const childrenPromises = shallowRef([]);
  provide("mapRootInitPromises", childrenPromises);
  return {
    mapRootRef: children,
    mapRootInitPromises: childrenPromises
  };
}
async function setupMapChildren({
  returnOnly,
  willDeleteByHand,
  strictMapRoot,
  requiredImport,
  createFunction,
  settings,
  settingsUpdateIgnoreKeys,
  settingsUpdateFull,
  isLayer,
  isProjection,
  mapRoot: _mapRoot,
  index
}) {
  if (!getCurrentScope()) {
    throwException({
      text: "setupMapChildren must be only called on runtime.",
      isInternal: true
    });
  }
  try {
    const mapRootRef = _mapRoot?.mapRootRef;
    const mapRootInitPromises = _mapRoot?.mapRootInitPromises;
    const children = shallowRef();
    const mapRoot = inject("mapRoot", null);
    const initPromises = inject("mapRootInitPromises", null);
    const map = injectMap();
    const layers = injectLayers();
    let timeouts = null;
    const timeoutCallback = (timeout, isDelete) => {
      if (!timeouts) timeouts = /* @__PURE__ */ new Set();
      if (!isDelete) timeouts.add(timeout);
      else timeouts.delete(timeout);
    };
    if (!returnOnly && !willDeleteByHand) {
      onBeforeUnmount(() => {
        if (children.value) {
          deleteMapChildren({
            children: children.value,
            isMercator: isProjection,
            root: mapRoot?.value ? mapRoot : map
          });
        }
        if (timeouts?.size) {
          timeouts.forEach((timeout) => clearTimeout(timeout));
          timeouts.clear();
        }
      });
    }
    if (settings) {
      let lastSettings = copy(settings);
      watch(settings, (value) => {
        if (!value) return;
        if (settingsUpdateFull) {
          if (children.value && "update" in children.value) children.value.update(value);
          return;
        }
        const settingsDiff = Object.keys(diff(lastSettings, value));
        if (settingsDiff.length === 0) return;
        const updatedSettings = copy(value);
        for (const key in updatedSettings) {
          if (!settingsDiff.includes(key)) delete updatedSettings[key];
        }
        const ignoreKeys = settingsUpdateIgnoreKeys && (isRef(settingsUpdateIgnoreKeys) ? settingsUpdateIgnoreKeys.value : settingsUpdateIgnoreKeys);
        if (ignoreKeys) excludeKeys(updatedSettings, ignoreKeys);
        if (Object.keys(updatedSettings).length === 0) return;
        lastSettings = copy(value);
        if (children.value && "update" in children.value) children.value.update(updatedSettings);
      }, { deep: true });
    }
    if (!returnOnly && !isProjection) {
      watch(() => toValue(index), (indexValue) => {
        if (!children.value || !map.value) {
          return;
        }
        deleteMapChildren({
          children: children.value,
          isMercator: isProjection,
          root: mapRoot?.value ? mapRoot : map
        });
        if (typeof mapRoot?.value === "object" && Array.isArray(mapRoot.value)) {
          mapRoot.value = [
            ...mapRoot.value,
            children.value
          ];
        } else {
          (mapRoot?.value || map.value).addChild(children.value, indexValue);
        }
      });
    }
    if (!isLayer && !isProjection) {
      await waitTillMapInit({ timeoutCallback });
      if (!map.value) {
        throwException({
          text: "map is undefined in setupMapChildren. Please verify that Yandex Maps were initialized successfully and you only use components inside <yandex-map>."
        });
      }
    } else {
      await waitTillYmapInit({ timeoutCallback });
    }
    if (strictMapRoot) {
      if (!mapRoot?.value) await nextTick();
      if (!mapRoot?.value) {
        throwException({
          text: `mapRoot is undefined in setupMapChildren. Please verify that you are using component inside it's root: for example, don't use Controls outside <yandex-map-controls>.`
        });
      }
    }
    if (mapRootInitPromises) {
      await nextTick();
      await Promise.all(mapRootInitPromises.value);
    }
    let importData;
    if (requiredImport) {
      const importPromise = requiredImport();
      if (initPromises?.value) initPromises.value.push(Promise.resolve(importPromise));
      importData = await importPromise;
    }
    children.value = createFunction(importData);
    if (mapRootRef && !mapRootRef.value) mapRootRef.value = children.value;
    if (!returnOnly && map.value && !isProjection) {
      if (initPromises?.value) {
        await Promise.all(initPromises.value);
        if (!requiredImport) await nextTick();
      }
      const indexValue = toValue(index);
      if (typeof mapRoot?.value === "object" && Array.isArray(mapRoot.value)) {
        mapRoot.value.splice(indexValue ?? mapRoot.value.length, 0, children.value);
        triggerRef(mapRoot);
      } else {
        (mapRoot?.value || map.value).addChild(children.value, indexValue);
      }
    } else if (isLayer) {
      layers.value.push(children.value);
    } else if (isProjection && map.value) {
      map.value.update({
        projection: children.value
      });
    }
    return children.value;
  } catch (e) {
    console.error("Error during map children loading", e);
    throw e;
  }
}
var _sfc_main$G = defineComponent({
  ...{ name: "YandexMapListener" },
  __name: "YandexMapListener",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapListener;
    onMounted(async () => {
      mapListener = await setupMapChildren({
        createFunction: () => new ymaps3.YMapListener(props.settings || {}),
        settings: computed(() => props.settings)
      });
      emit("update:modelValue", mapListener);
    });
    return () => {
    };
  }
});
var _sfc_main$F = defineComponent({
  ...{ name: "YandexMapDefaultFeaturesLayer" },
  __name: "YandexMapDefaultFeaturesLayer",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const hold = inject("needsToHold");
    hold.value++;
    let mapLayer;
    onMounted(async () => {
      mapLayer = await setupMapChildren({
        createFunction: () => new ymaps3.YMapDefaultFeaturesLayer(props.settings || {}),
        settings: computed(() => props.settings),
        isLayer: true
      });
      emit("update:modelValue", mapLayer);
      hold.value--;
    });
    return () => {
    };
  }
});
var _sfc_main$E = defineComponent({
  ...{ name: "YandexMapDefaultSchemeLayer" },
  __name: "YandexMapDefaultSchemeLayer",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const hold = inject("needsToHold");
    hold.value++;
    let mapLayer;
    onMounted(async () => {
      mapLayer = await setupMapChildren({
        createFunction: () => new ymaps3.YMapDefaultSchemeLayer(props.settings || {}),
        settings: computed(() => props.settings),
        isLayer: true
      });
      emit("update:modelValue", mapLayer);
      hold.value--;
    });
    return () => {
    };
  }
});
var _sfc_main$D = defineComponent({
  ...{ name: "YandexMapTileDataSource" },
  __name: "YandexMapTileDataSource",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const hold = inject("needsToHold");
    hold.value++;
    let mapChildren;
    onMounted(async () => {
      if (!props.settings.id) {
        throwException({
          text: "You must specify id in YandexMapTileDataSource settings"
        });
      }
      mapChildren = await setupMapChildren({
        createFunction: () => new ymaps3.YMapTileDataSource(props.settings),
        settings: computed(() => props.settings),
        isLayer: true
      });
      emit("update:modelValue", mapChildren);
      hold.value--;
    });
    return () => {
    };
  }
});
var _sfc_main$C = defineComponent({
  ...{ name: "YandexMapFeatureDataSource" },
  __name: "YandexMapFeatureDataSource",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const hold = inject("needsToHold");
    hold.value++;
    let mapChildren;
    onMounted(async () => {
      if (!props.settings.id) {
        throwException({
          text: "You must specify id in YandexMapFeatureDataSource settings"
        });
      }
      mapChildren = await setupMapChildren({
        createFunction: () => new ymaps3.YMapFeatureDataSource(props.settings),
        settings: computed(() => props.settings),
        isLayer: true
      });
      emit("update:modelValue", mapChildren);
      hold.value--;
    });
    return () => {
    };
  }
});
var _sfc_main$B = defineComponent({
  ...{ name: "YandexMapLayer" },
  __name: "YandexMapLayer",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const hold = inject("needsToHold");
    hold.value++;
    let mapLayer;
    onMounted(async () => {
      if (!props.settings.type) {
        throwException({
          text: "You must specify type in YandexMapLayer settings"
        });
      }
      mapLayer = await setupMapChildren({
        createFunction: () => new ymaps3.YMapLayer(props.settings || {}),
        settings: computed(() => props.settings),
        isLayer: true
      });
      emit("update:modelValue", mapLayer);
      hold.value--;
    });
    return () => {
    };
  }
});
function getMarkerContainerProps({
  position,
  containerAttrs,
  wrapperAttrs,
  zeroSizes
}) {
  const root = {
    class: ["__ymap-marker"],
    style: {}
  };
  const children = {
    class: ["__ymap-marker_wrapper"],
    style: {}
  };
  const isDefaultPosition = position === "default" || position === "default default";
  if (position && !isDefaultPosition) {
    if (position.startsWith("translate")) {
      children.style.transform = position;
    } else {
      let translateX = 0;
      let translateY = 0;
      const splitted = position.split(" ");
      for (let i = 0; i < splitted.length; i++) {
        let local = 0;
        const item = splitted[i];
        switch (item) {
          case "top":
          case "left":
            local = -100;
            break;
          case "top-center":
          case "left-center":
            local = -50;
            break;
          case "bottom":
          case "right":
            local = 100;
            break;
          case "bottom-center":
          case "right-center":
            local = 50;
            break;
          default:
            local = 0;
        }
        if (item.startsWith("left") || item.startsWith("right")) translateX = local;
        else translateY = local;
      }
      children.style.transform = `translate(${translateX}%, ${translateY}%)`;
    }
  }
  if (zeroSizes === true || zeroSizes !== false && position && !isDefaultPosition) {
    root.style.width = "0";
    root.style.height = "0";
    if (children.style.transform) children.style.width = "fit-content";
  }
  const attrs = {
    root: { ...containerAttrs ?? {} },
    children: { ...wrapperAttrs ?? {} }
  };
  for (const [key, value] of Object.entries(attrs)) {
    const obj = key === "root" ? root : children;
    if (value.class) {
      if (!Array.isArray(value.class)) value.class = [value.class];
      value.class = [
        ...obj.class,
        ...value.class
      ];
    }
    if (value?.style) {
      if (typeof value.style !== "object" || Array.isArray(value.style)) {
        console.warn(`Style property was given in ${key} of marker, but it is not an object. Style of this prop can only be an object, therefore it was ignored.`);
      } else {
        value.style = {
          ...obj.style,
          ...value.style
        };
      }
    }
    Object.assign(obj, value);
  }
  return {
    root,
    children
  };
}
function excludeYandexMarkerProps(props) {
  props = { ...props };
  const toExclude = {
    position: true,
    containerAttrs: true,
    wrapperAttrs: true,
    zeroSizes: true
  };
  for (const excluded in toExclude) {
    if (excluded in props) delete props[excluded];
  }
  return props;
}
var _sfc_main$A = defineComponent({
  ...{ name: "YandexMapMarker" },
  __name: "YandexMapMarker",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    },
    /**
    * @description Sets translate(%, %) to marker to align it properly.
    *
    * If you want to make aligment to be like Yandex Maps 2.0, set this property to "top left-center".
    * @default default (as goes in Yandex by default)
    */
    position: {
      type: String
    },
    /**
    * @description Allows you to add any attributes to <div class="__ymap-marker"> container.
    *
    * Important: to pass styles, you must use object-style prop instead of string.
    */
    containerAttrs: {
      type: Object,
      default: () => ({})
    },
    /**
    * @description Allows you to add any attributes to <div class="__ymap-marker_wrapper"> container.
    *
    * Important: to pass styles, you must use object-style prop instead of string.
    */
    wrapperAttrs: {
      type: Object,
      default: () => ({})
    },
    /**
    * @description Will add width and height: 0 to container.
    *
    * Null enables default behavior, false disables it completely (even if position is specified).
    *
    * @default true if position is specified, false otherwise
    */
    zeroSizes: {
      type: Boolean,
      default: null
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    const element = ref(null);
    function clearElement() {
      if (!element.value?.parentElement?.closest("ymaps")) element.value?.remove();
    }
    onMounted(async () => {
      if (!props.settings.coordinates) {
        throwException({
          text: "You must specify coordinates in YandexMapMarker settings"
        });
      }
      mapChildren = await setupMapChildren({
        settings: computed(() => props.settings),
        createFunction: () => new ymaps3.YMapMarker(props.settings, element.value)
      });
      clearElement();
      emit("update:modelValue", mapChildren);
    });
    let mapParent = void 0;
    onUpdated(() => {
      if (!mapParent && element.value?.parentElement?.closest("ymaps")) mapParent = element.value.parentElement;
      else if (mapParent && element.value && !element.value?.parentElement?.closest("ymaps")) mapParent.appendChild(element.value);
      clearElement();
    });
    const rootProps = computed(() => getMarkerContainerProps({
      position: props.position,
      containerAttrs: props.containerAttrs,
      wrapperAttrs: props.wrapperAttrs,
      zeroSizes: props.zeroSizes
    }));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", mergeProps(rootProps.value.root, {
        ref_key: "element",
        ref: element,
        class: "__ymap_marker"
      }), [
        createBaseVNode("div", normalizeProps(guardReactiveProps(rootProps.value.children)), [
          renderSlot(_ctx.$slots, "default")
        ], 16)
      ], 16);
    };
  }
});
var _sfc_main$z = defineComponent({
  ...{ name: "YandexMapDefaultMarker" },
  __name: "YandexMapDefaultMarker",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const slots = useSlots();
    let mapChildren;
    const popup = ref(null);
    const contentFunc = () => {
      return popup.value;
    };
    const getSettings = computed(() => {
      const settings = { ...props.settings };
      if (settings.popup && (typeof settings.popup.content === "undefined" || settings.popup.content === "fromSlot") && popup.value) {
        settings.popup = {
          ...settings.popup,
          content: contentFunc
        };
      }
      return settings;
    });
    onMounted(async () => {
      if (!props.settings.coordinates) {
        throwException({
          text: "You must specify coordinates in YandexMapDefaultMarker settings"
        });
      }
      mapChildren = await setupMapChildren({
        createFunction: ({ YMapDefaultMarker: Marker }) => new Marker(getSettings.value),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: getSettings
      });
      emit("update:modelValue", mapChildren);
    });
    watch(popup, () => {
      if (popup.value) popup.value.parentNode?.removeChild(popup.value);
    });
    return (_ctx, _cache) => {
      return !!unref(slots).popup ? (openBlock(), createElementBlock("div", {
        key: 0,
        ref_key: "popup",
        ref: popup,
        class: "__ymap_default-marker-popup"
      }, [
        renderSlot(_ctx.$slots, "popup")
      ], 512)) : createCommentVNode("", true);
    };
  }
});
var _sfc_main$y = defineComponent({
  ...{ name: "YandexMapFeature" },
  __name: "YandexMapFeature",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      if (!props.settings.geometry) {
        throwException({
          text: "You must specify geometry in YandexMapFeature settings"
        });
      }
      mapChildren = await setupMapChildren({
        createFunction: () => new ymaps3.YMapFeature(props.settings),
        settings: computed(() => props.settings)
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$x = defineComponent({
  ...{ name: "YandexMapControls" },
  __name: "YandexMapControls",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const mapChildren = shallowRef(null);
    const mapRoot = provideMapRoot();
    onMounted(async () => {
      if (!props.settings.position) {
        throwException({
          text: "You must specify position in YandexMapControls settings"
        });
      }
      mapChildren.value = await setupMapChildren({
        createFunction: () => new ymaps3.YMapControls(props.settings),
        mapRoot,
        settings: computed(() => props.settings)
      });
      emit("update:modelValue", mapChildren.value);
    });
    return (_ctx, _cache) => {
      return mapChildren.value ? renderSlot(_ctx.$slots, "default", { key: 0 }) : createCommentVNode("", true);
    };
  }
});
var _sfc_main$w = defineComponent({
  ...{ name: "YandexMapControl" },
  __name: "YandexMapControl",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    const element = ref(null);
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: () => new ymaps3.YMapControl(props.settings, element.value),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "element",
        ref: element,
        class: "__ymap_control"
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 512);
    };
  }
});
var _sfc_main$v = defineComponent({
  ...{ name: "YandexMapControlButton" },
  __name: "YandexMapControlButton",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    const element = ref(null);
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: () => new ymaps3.YMapControlButton({
          ...props.settings,
          element: element.value
        }),
        settings: computed(() => ({
          ...props.settings,
          element: element.value
        })),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "element",
        ref: element,
        class: "__ymap_control-button"
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 512);
    };
  }
});
var _sfc_main$u = defineComponent({
  ...{ name: "YandexMapGeolocationControl" },
  __name: "YandexMapGeolocationControl",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: (controls) => new controls.YMapGeolocationControl(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$t = defineComponent({
  ...{ name: "YandexMapZoomControl" },
  __name: "YandexMapZoomControl",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: (controls) => new controls.YMapZoomControl(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$s = defineComponent({
  ...{ name: "YandexMapScaleControl" },
  __name: "YandexMapScaleControl",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: () => new ymaps3.YMapScaleControl(props.settings),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$r = defineComponent({
  ...{ name: "YandexMapCartesianProjection" },
  __name: "YandexMapCartesianProjection",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    bounds: {
      type: Array,
      required: true
    },
    cycled: {
      type: Array
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const hold = inject("needsToHold");
    hold.value++;
    const projection = inject("projection");
    onMounted(async () => {
      if (!projection) return;
      const cartesian = await setupMapChildren({
        isProjection: true,
        createFunction: ({ Cartesian: CartesianClass }) => new CartesianClass(props.bounds, props.cycled),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-cartesian-projection")
      });
      projection.value = cartesian;
      emit("update:modelValue", cartesian);
      hold.value--;
    });
    return () => {
    };
  }
});
var _sfc_main$q = defineComponent({
  ...{ name: "YandexMapWebMercatorProjection" },
  __name: "YandexMapWebMercatorProjection",
  props: {
    modelValue: {
      type: Object,
      default: null
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const hold = inject("needsToHold");
    hold.value++;
    const projection = inject("projection");
    onMounted(async () => {
      if (!projection) return;
      const cartesian = await setupMapChildren({
        isProjection: true,
        createFunction: ({ WebMercator: WebMercatorClass }) => new WebMercatorClass(),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-web-mercator-projection")
      });
      projection.value = cartesian;
      emit("update:modelValue", cartesian);
      hold.value--;
    });
    return () => {
    };
  }
});
var _sfc_main$p = defineComponent({
  ...{ name: "YandexMapHint" },
  __name: "YandexMapHint",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    // Property that you will set on YandexMapMarker or YandexMapFeature to display hint content
    hintProperty: {
      type: String,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    const element = shallowRef(null);
    const hintContent = shallowRef("");
    onMounted(async () => {
      await setupMapChildren({
        createFunction: ({
          YMapHint: MapHint,
          YMapHintContext
        }) => {
          mapChildren = new MapHint({
            hint: (object) => object?.properties?.[props.hintProperty]
          });
          class Hint extends ymaps3.YMapEntity {
            _onAttach() {
              const e = this;
              e._element = element.value;
              e._detachDom = ymaps3.useDomContext(e, e._element, null);
              e._watchContext(YMapHintContext, () => {
                hintContent.value = e._consumeContext(YMapHintContext)?.[props.hintProperty];
              }, { immediate: true });
            }
            _onDetach() {
              this._detachDom();
            }
          }
          mapChildren.addChild(new Hint({}));
          return mapChildren;
        },
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-hint")
      });
      emit("update:modelValue", mapChildren);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "element",
        ref: element,
        class: "__ymap_hint"
      }, [
        renderSlot(_ctx.$slots, "default", { content: hintContent.value })
      ], 512);
    };
  }
});
var _sfc_main$o = defineComponent({
  ...{ name: "YandexMapOpenMapsButton" },
  __name: "YandexMapOpenMapsButton",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: ({ YMapOpenMapsButton: OpenMapsButton }) => new OpenMapsButton(props.settings),
        requiredImport: () => ymaps3.import("@yandex/ymaps3-controls-extra"),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$n = defineComponent({
  name: "YandexMapClustererCluster",
  props: {
    clusterMarkerProps: {
      type: Object,
      default: () => ({})
    },
    zoomOnClusterClick: {
      type: [Boolean, Object],
      default: false
    },
    feature: {
      type: Object,
      required: true
    }
  },
  emits: {
    // Exact features bounds returned on cluster click
    trueBounds(bounds) {
      return bounds.length === 2;
    },
    // Auto-corrected features bounds returned on cluster click
    updatedBounds(bounds) {
      return bounds.length === 2;
    },
    updatedCluster(clusterId) {
      return true;
    }
  },
  slots: Object,
  setup(props, { slots, emit }) {
    const map = injectMap();
    const element = ref(null);
    const containerProps = computed(() => getMarkerContainerProps({
      position: props.clusterMarkerProps?.position ?? "top-center left-center",
      containerAttrs: props.clusterMarkerProps?.containerAttrs,
      wrapperAttrs: props.clusterMarkerProps?.wrapperAttrs,
      zeroSizes: props.clusterMarkerProps?.zeroSizes
    }));
    function updateElement() {
      const _element = element.value;
      if (!_element) return;
      const clusterElement = props.feature.element;
      const clusterer = props.feature.clusterer;
      if (clusterElement.children.length) {
        clusterElement.children.forEach((x) => {
          try {
            clusterElement.removeChild(x);
          } catch (e) {
            console.warn("Non-fatal error occurred when updating Map clusterer", e);
          }
        });
      }
      try {
        clusterElement.addChild(new ymaps3.YMapMarker({
          ...excludeYandexMarkerProps(props.clusterMarkerProps),
          coordinates: clusterer.lnglat,
          onClick: async (event, mapEvent) => {
            props.clusterMarkerProps.onClick?.(event, mapEvent);
            if (clusterer.features.length >= 2) {
              const settings = typeof props.zoomOnClusterClick === "object" ? props.zoomOnClusterClick : {};
              const featuresCoords = clusterer.features.map((x) => x.geometry.coordinates);
              const bounds = getBoundsFromCoords(featuresCoords);
              emit("trueBounds", bounds);
              if (!props.zoomOnClusterClick) return;
              const defaultDuration = settings.duration ?? 500;
              if (settings.strategy === "boundsCorrect") {
                const [[minLongitude, maxLatitude], [maxLongitude, minLatitude]] = bounds;
                const latDiff = maxLatitude - minLatitude;
                const longDiff = maxLongitude - minLongitude;
                const updatedBounds = [[minLongitude - longDiff, maxLatitude - latDiff], [maxLongitude + longDiff, minLatitude + latDiff]];
                emit("updatedBounds", updatedBounds);
                map.value?.setLocation({
                  bounds: updatedBounds,
                  duration: defaultDuration,
                  easing: settings.easing
                });
              } else {
                const { center, zoom } = await getLocationFromBounds({
                  bounds,
                  map: map.value,
                  roundZoom: true,
                  comfortZoomLevel: true
                });
                map.value?.setLocation({
                  center,
                  zoom,
                  duration: defaultDuration,
                  easing: settings.easing
                });
                await sleep(defaultDuration + 50);
                if (map.value) emit("updatedBounds", map.value.bounds);
              }
            }
          }
        }, _element));
      } catch (e) {
        console.error(e);
      }
    }
    watch(element, updateElement);
    const firstUpdate = ref(false);
    onUpdated(() => {
      if (!firstUpdate.value) {
        firstUpdate.value = true;
        return;
      }
      emit("updatedCluster", props.feature.clusterer.clusterId);
    });
    return () => {
      return hF([
        h("div", {
          ...containerProps.value.root,
          ref: element
        }, [
          h("div", containerProps.value.children, slots.default?.({
            clusterer: props.feature.clusterer,
            coordinates: props.feature.clusterer.lnglat,
            length: props.feature.clusterer.features.length
          }))
        ])
      ]);
    };
  }
});
var _hoisted_1$1 = { class: "__ymap_clusterer_clusters" };
var _sfc_main$m = defineComponent({
  ...{ name: "YandexMapClustererClusters" },
  __name: "YandexMapClustererClusters",
  props: {
    clusterMarkerProps: {
      type: Object,
      default: () => ({})
    },
    zoomOnClusterClick: {
      type: [Boolean, Object],
      default: false
    }
  },
  emits: ["trueBounds", "updatedBounds", "updatedCluster"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const features = inject("clusterFeatures");
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(unref(features), (feature) => {
          return openBlock(), createBlock(_sfc_main$n, {
            key: feature.clusterer.clusterId,
            "cluster-marker-props": __props.clusterMarkerProps,
            feature,
            "zoom-on-cluster-click": __props.zoomOnClusterClick,
            onTrueBounds: _cache[0] || (_cache[0] = ($event) => emit("trueBounds", $event)),
            onUpdatedBounds: _cache[1] || (_cache[1] = ($event) => emit("updatedBounds", $event)),
            onUpdatedCluster: _cache[2] || (_cache[2] = ($event) => emit("updatedCluster", $event))
          }, {
            default: withCtx((options) => [
              renderSlot(_ctx.$slots, "default", mergeProps({ ref_for: true }, options))
            ]),
            _: 3
          }, 8, ["cluster-marker-props", "feature", "zoom-on-cluster-click"]);
        }), 128))
      ]);
    };
  }
});
var _hoisted_1 = {
  key: 0,
  class: "__ymap_clusterer--empty"
};
var _hoisted_2 = {
  key: 1,
  class: "__ymap-clusterer"
};
var _sfc_main$l = defineComponent({
  ...{ name: "YandexMapClusterer" },
  __name: "YandexMapClusterer",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    /**
    * @description All custom (non-settings) props are also supported
    */
    clusterMarkerProps: {
      type: Object,
      default: () => ({})
    },
    /**
    * @description Size of the grid division in pixels
    *
    * Used in settings.method via Yandex clusterByGrid method
    *
    * @see https://yandex.ru/maps-api/docs/js-api/object/markers/YMapClusterer.html
    */
    gridSize: {
      type: Number,
      default: 64
    },
    /**
    * @description Zooms to bounds of features of cluster
    */
    zoomOnClusterClick: {
      type: [Boolean, Object],
      default: false
    }
  },
  emits: ["update:modelValue", "trueBounds", "updatedBounds"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const mapChildren = shallowRef(null);
    const entities = shallowRef([]);
    const clusterFeatures = shallowRef([]);
    const revision = ref(0);
    const filteredFeatures = computed(() => clusterFeatures.value.filter((x) => x.clusterer.features.length > 1));
    provide("clusterFeatures", filteredFeatures);
    let _clusterByGrid;
    const tickTimeout = computed(() => props.settings.tickTimeout);
    const getSettings = () => {
      const settings = { ...props.settings };
      if (!settings.method && _clusterByGrid) settings.method = _clusterByGrid?.({ gridSize: props.gridSize });
      if (tickTimeout.value) settings.tickTimeout = tickTimeout.value;
      let marker = settings.marker;
      if (!marker) {
        marker = (feature) => {
          const entity = entities.value.find((x) => x._props.id === feature.id);
          if (!entity) {
            throwException({
              text: `No entity with id ${feature.id} (coordinates: ${feature.geometry.coordinates.join(", ")}) were found in YandexMapClusterer.`,
              isInternal: true,
              warn: true
            });
            return new ymaps3.YMapMarker({ coordinates: feature.geometry.coordinates });
          }
          return entity;
        };
      }
      const cluster = (coordinates) => {
        const foundCluster = clusterFeatures.value.find((x) => x.clusterer.lnglat[0] === coordinates[0] && x.clusterer.lnglat[1] === coordinates[1]);
        if (!foundCluster) {
          throwException({
            text: `No element with coordinates of ${coordinates.join(", ")} were found in YandexMapClusterer.`,
            isInternal: true,
            warn: true
          });
          return new ymaps3.YMapMarker({ coordinates });
        }
        return foundCluster.element;
      };
      let features = settings.features;
      if (!features) {
        features = entities.value.map((entity, i) => {
          if (!entity._props.id) {
            entity.update({
              id: Math.random().toString() + Date.now().toString()
            });
          }
          return {
            type: "Feature",
            id: entity._props.id,
            geometry: {
              type: "Point",
              coordinates: entity._props.coordinates
            },
            properties: "properties" in entity._props ? entity._props.properties : {}
          };
        });
      }
      settings.onRender = (clustersList) => {
        if (clustersList.length <= 1) revision.value++;
        clusterFeatures.value = clustersList.map((clusterer) => {
          clusterer.clusterId = `cluster-${revision.value}-${clusterer.features.map((x) => x.id).join(",")}`;
          return {
            clusterer,
            element: clusterFeatures.value.find((x) => x.clusterer.clusterId === clusterer.clusterId)?.element || new ymaps3.YMapCollection({})
          };
        });
        if (props.settings.onRender) return props.settings.onRender(clustersList);
      };
      return {
        ...settings,
        marker,
        features,
        cluster
      };
    };
    const update = async () => {
      clusterFeatures.value = [];
      await nextTick();
      mapChildren.value?.update(getSettings());
      mapChildren.value?._render();
    };
    watch(() => [props.settings, props.gridSize], () => {
      update();
    }, {
      deep: true
    });
    const mapRoot = provideMapRoot({ mapRootRef: entities });
    const init = async () => {
      mapChildren.value = await setupMapChildren({
        createFunction: ({
          YMapClusterer: Clusterer,
          clusterByGrid: _clusterByGrid_
        }) => {
          _clusterByGrid = _clusterByGrid_;
          const settings = getSettings();
          if (settings.features.length > 0) {
            settings.features = [];
          }
          return new Clusterer(settings);
        },
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-clusterer"),
        mapRoot
      });
      emit("update:modelValue", mapChildren.value);
    };
    watch(entities, async () => {
      await nextTick();
      update();
    });
    onMounted(async () => {
      await init();
    });
    return (_ctx, _cache) => {
      return !mapChildren.value ? (openBlock(), createElementBlock("div", _hoisted_1)) : (openBlock(), createElementBlock("div", _hoisted_2, [
        renderSlot(_ctx.$slots, "default"),
        createVNode(_sfc_main$m, {
          "cluster-marker-props": __props.clusterMarkerProps,
          "zoom-on-cluster-click": __props.zoomOnClusterClick,
          onTrueBounds: _cache[0] || (_cache[0] = ($event) => emit("trueBounds", $event)),
          onUpdatedBounds: _cache[1] || (_cache[1] = ($event) => emit("updatedBounds", $event)),
          onUpdatedCluster: _cache[2] || (_cache[2] = ($event) => revision.value++)
        }, {
          default: withCtx((options) => [
            renderSlot(_ctx.$slots, "cluster", normalizeProps(guardReactiveProps(options)))
          ]),
          _: 3
        }, 8, ["cluster-marker-props", "zoom-on-cluster-click"])
      ]));
    };
  }
});
var _sfc_main$k = defineComponent({
  ...{ name: "YandexMapCollection" },
  __name: "YandexMapCollection",
  props: {
    modelValue: {
      type: Object,
      default: null
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const mapChildren = shallowRef(null);
    const mapRoot = provideMapRoot();
    onMounted(async () => {
      mapChildren.value = await setupMapChildren({
        createFunction: () => new ymaps3.YMapCollection({}),
        mapRoot
      });
      emit("update:modelValue", mapChildren.value);
    });
    return (_ctx, _cache) => {
      return mapChildren.value ? renderSlot(_ctx.$slots, "default", { key: 0 }) : createCommentVNode("", true);
    };
  }
});
var _sfc_main$j = defineComponent({
  ...{ name: "YandexMapEntity" },
  __name: "YandexMapEntity",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    index: {
      type: Number
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    const element = ref(null);
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: () => {
          class Entity extends ymaps3.YMapEntity {
            _onAttach() {
              this._element = element.value;
              this._detachDom = ymaps3.useDomContext(this, this._element);
            }
            _onDetach() {
              this._detachDom();
              this._detachDom = null;
              this._element = null;
            }
          }
          return new Entity({});
        },
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "element",
        ref: element,
        class: "__ymap_entity"
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 512);
    };
  }
});
var _sfc_main$i = defineComponent({
  name: "YandexMapRuler",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    pointProps: {
      type: Object,
      default: () => ({})
    },
    previewPointProps: {
      type: [String, Object],
      default: () => ({})
    },
    /**
    * @description readonly-array with all points states
    */
    pointsState: {
      type: Array,
      default: () => []
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    },
    "update:pointsState"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    let mapChildren;
    class RulerPoint extends ymaps3.YMapComplexEntity {
      entity;
      constructor(props2, entity) {
        super(props2);
        this.entity = entity;
      }
      _onUpdate(props2) {
        if (props2.state !== void 0) {
          this.entity.state.state = props2.state;
          triggerRef(entities);
        }
      }
    }
    const previewPoint = ref(null);
    const entities = shallowRef([]);
    watch(entities, () => {
      emit("update:pointsState", entities.value.map((x) => x.state));
    });
    const getEntity = (state) => {
      const rulerPoint = {};
      rulerPoint.entity = new RulerPoint(state, rulerPoint);
      return rulerPoint;
    };
    const handleEntityRequest = (params) => {
      const entity = getEntity(params);
      entities.value.splice(params.state.index, 0, entity);
      entity.state = params;
      triggerRef(entities);
      return entity.entity;
    };
    const handleUpdate = (state) => {
      props.settings.onUpdate?.(state);
      if (state.points.length >= entities.value.length) return;
      const actualPoints = new Set(state.points.map((p) => String(p)));
      entities.value = entities.value.filter(({ state: entityState }) => actualPoints.has(String(entityState?.state.coordinates)));
    };
    const settings = computed(() => {
      return {
        ...props.settings,
        point: handleEntityRequest,
        previewPoint: previewPoint.value ?? document.createElement("div"),
        onUpdate: handleUpdate
      };
    });
    onMounted(async () => {
      try {
        mapChildren = await setupMapChildren({
          createFunction: (controls) => new controls.YMapRuler(settings.value),
          requiredImport: () => ymaps3.import("@yandex/ymaps3-ruler"),
          settings
        });
        emit("input", mapChildren);
        emit("update:modelValue", mapChildren);
      } catch (e) {
        console.error(e);
      }
    });
    const containerProps = computed(() => getMarkerContainerProps({
      position: props.pointProps?.position ?? "top-center left-center",
      containerAttrs: props.pointProps?.containerAttrs,
      wrapperAttrs: props.pointProps?.wrapperAttrs,
      zeroSizes: props.pointProps?.zeroSizes
    }));
    const previewProps = computed(() => {
      const settings2 = props.previewPointProps === "fromPointProps" ? props.pointProps : props.previewPointProps;
      return getMarkerContainerProps({
        position: settings2.position ?? "top-center left-center",
        containerAttrs: settings2.containerAttrs,
        wrapperAttrs: settings2.wrapperAttrs,
        zeroSizes: settings2.zeroSizes
      });
    });
    return () => {
      const list = Object.values(entities.value);
      const entitiesSlots = list.map(({ entity, state }) => {
        return hF([
          h("div", {
            ...containerProps.value.root,
            ref: (element) => {
              if (!element) return;
              const settings2 = {
                ...props.pointProps,
                coordinates: state.state.coordinates,
                draggable: props.settings.editable ?? state.state.editable,
                source: state.state.source,
                onDragEnd: (...args) => {
                  props.pointProps.onDragEnd?.(...args);
                  state.onDragEnd(...args);
                },
                onDragMove: (...args) => {
                  props.pointProps.onDragMove?.(...args);
                  state.onDragMove(...args);
                },
                onDragStart: (...args) => {
                  props.pointProps.onDragStart?.(...args);
                  state.onDragStart(...args);
                }
              };
              if (entity.children.length && element.closest("ymaps")) {
                const marker2 = entity.children[0];
                marker2.update(settings2);
                return;
              }
              const marker = new ymaps3.YMapMarker(settings2, element);
              entity.children.map((x) => entity.removeChild(x));
              entity.addChild(marker);
            }
          }, [h("div", containerProps.value.children, slots.point(state))])
        ], {
          key: String(state.state.index) + state?.state.totalCount
        });
      });
      return [
        hF(entitiesSlots),
        h("div", {
          ...previewProps.value.root,
          ref: previewPoint
        }, [h("div", previewProps.value.children, slots.previewPoint({}))])
      ];
    };
  }
});
var _sfc_main$h = defineComponent({
  ...{ name: "YandexMapTrafficLayer" },
  __name: "YandexMapTrafficLayer",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapLayer;
    onMounted(async () => {
      mapLayer = await setupMapChildren({
        createFunction: (layers) => new layers.YMapTrafficLayer(props.settings || {}),
        requiredImport: () => importLayersExtra(),
        settings: computed(() => props.settings)
      });
      emit("update:modelValue", mapLayer);
    });
    return () => {
    };
  }
});
var _sfc_main$g = defineComponent({
  ...{ name: "YandexMapTrafficEventsLayer" },
  __name: "YandexMapTrafficEventsLayer",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapLayer;
    onMounted(async () => {
      mapLayer = await setupMapChildren({
        createFunction: (layers) => new layers.YMapTrafficEventsLayer(props.settings || {}),
        requiredImport: () => importLayersExtra(),
        settings: computed(() => props.settings)
      });
      emit("update:modelValue", mapLayer);
    });
    return () => {
    };
  }
});
var _sfc_main$f = defineComponent({
  ...{ name: "YandexMapRotateControl" },
  __name: "YandexMapRotateControl",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: ({ YMapRotateControl: RotateControl }) => new RotateControl(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$e = defineComponent({
  ...{ name: "YandexMapTiltControl" },
  __name: "YandexMapTiltControl",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: ({ YMapTiltControl: TiltControl }) => new TiltControl(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$d = defineComponent({
  ...{ name: "YandexMapRotateTiltControl" },
  __name: "YandexMapRotateTiltControl",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: ({ YMapRotateTiltControl: RotateTiltControl }) => new RotateTiltControl(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$c = defineComponent({
  ...{ name: "YandexMapResizer" },
  __name: "YandexMapResizer",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: (controls) => new controls.YMapResizer(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-resizer"),
        settings: computed(() => props.settings)
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$b = defineComponent({
  ...{ name: "YandexMapMiniMap" },
  __name: "YandexMapMiniMap",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: (controls) => new controls.YMapMiniMap(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-minimap"),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$a = defineComponent({
  ...{ name: "YandexMapContextMenu" },
  __name: "YandexMapContextMenu",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const mapChildren = shallowRef(void 0);
    const mapRoot = provideMapRoot();
    onMounted(async () => {
      mapChildren.value = await setupMapChildren({
        createFunction: (controls) => new controls.YMapContextMenu(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-context-menu"),
        settings: computed(() => props.settings),
        mapRoot
      });
      emit("update:modelValue", mapChildren.value);
    });
    return (_ctx, _cache) => {
      return mapChildren.value ? renderSlot(_ctx.$slots, "default", { key: 0 }) : createCommentVNode("", true);
    };
  }
});
var _sfc_main$9 = defineComponent({
  ...{ name: "YandexMapContextMenuItem" },
  __name: "YandexMapContextMenuItem",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: (controls) => new controls.YMapContextMenuItem(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-context-menu"),
        settings: computed(() => props.settings),
        strictMapRoot: true
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$8 = defineComponent({
  ...{ name: "YandexMapDrawerControl" },
  __name: "YandexMapDrawerControl",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const content = ref(null);
    const mapChildren = shallowRef(void 0);
    const contentFunc = () => {
      return content.value;
    };
    const getSettings = computed(() => {
      return { ...props.settings, content: contentFunc };
    });
    onMounted(async () => {
      mapChildren.value = await setupMapChildren({
        createFunction: (controls) => new controls.YMapDrawerControl(getSettings.value),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-drawer-control"),
        settings: getSettings
      });
      emit("update:modelValue", mapChildren.value);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "content",
        ref: content,
        class: "__ymap_drawer"
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 512);
    };
  }
});
var _sfc_main$7 = defineComponent({
  ...{ name: "YandexMapSignpost" },
  __name: "YandexMapSignpost",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const mapChildren = shallowRef(void 0);
    onMounted(async () => {
      mapChildren.value = await setupMapChildren({
        createFunction: (controls) => new controls.YMapSignpost(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-signpost"),
        settings: computed(() => props.settings)
      });
      emit("update:modelValue", mapChildren.value);
    });
    return () => {
    };
  }
});
var _sfc_main$6 = defineComponent({
  ...{ name: "YandexMapSpinner" },
  __name: "YandexMapSpinner",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const mapChildren = shallowRef(void 0);
    onMounted(async () => {
      mapChildren.value = await setupMapChildren({
        createFunction: (controls) => new controls.YMapSpinner(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-spinner"),
        settings: computed(() => props.settings)
      });
      emit("update:modelValue", mapChildren.value);
    });
    return () => {
    };
  }
});
var _sfc_main$5 = defineComponent({
  ...{ name: "YandexMapSearchControl" },
  __name: "YandexMapSearchControl",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: ({ YMapSearchControl: TiltControl }) => new TiltControl(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$4 = defineComponent({
  ...{ name: "YandexMapRouteControl" },
  __name: "YandexMapRouteControl",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    onMounted(async () => {
      mapChildren = await setupMapChildren({
        createFunction: ({ YMapRouteControl: TiltControl }) => new TiltControl(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: computed(() => props.settings),
        strictMapRoot: true,
        index: toRef(props, "index")
      });
      emit("update:modelValue", mapChildren);
    });
    return () => {
    };
  }
});
var _sfc_main$3 = defineComponent({
  ...{ name: "YandexMapPopupMarker" },
  __name: "YandexMapPopupMarker",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let mapChildren;
    const element = ref(null);
    const contentFunc = () => {
      return element.value;
    };
    const getSettings = computed(() => {
      return {
        ...props.settings,
        content: contentFunc
      };
    });
    onMounted(async () => {
      if (!props.settings.coordinates) {
        throwException({
          text: "You must specify coordinates in YandexMapPopupMarker settings"
        });
      }
      mapChildren = await setupMapChildren({
        createFunction: ({ YMapPopupMarker: Marker }) => new Marker(getSettings.value),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: getSettings
      });
      emit("update:modelValue", mapChildren);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "element",
        ref: element,
        class: "__ymap_popup-marker"
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 512);
    };
  }
});
var _sfc_main$2 = defineComponent({
  ...{ name: "YandexMapOverlay" },
  __name: "YandexMapOverlay",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const mapChildren = shallowRef(void 0);
    const element = ref(document.createElement("div"));
    watch(element, (_, oldVal) => {
      oldVal?.remove();
    });
    const getSettings = computed(() => {
      return {
        ...props.settings,
        htmlElement: element.value
      };
    });
    onMounted(async () => {
      mapChildren.value = await setupMapChildren({
        createFunction: (theme) => new theme.YMapOverlay(getSettings.value),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: getSettings
      });
      emit("update:modelValue", mapChildren.value);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "element",
        ref: element,
        class: "__ymap_overlay"
      }, [
        renderSlot(_ctx.$slots, "default")
      ], 512);
    };
  }
});
var _sfc_main$1 = defineComponent({
  ...{ name: "YandexMapImageOverlay" },
  __name: "YandexMapImageOverlay",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const mapChildren = shallowRef(void 0);
    onMounted(async () => {
      mapChildren.value = await setupMapChildren({
        createFunction: (theme) => new theme.YMapImageOverlay(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: computed(() => props.settings)
      });
      emit("update:modelValue", mapChildren.value);
    });
    return () => {
    };
  }
});
var _sfc_main = defineComponent({
  ...{ name: "YandexMapVideoOverlay" },
  __name: "YandexMapVideoOverlay",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const mapChildren = shallowRef(void 0);
    onMounted(async () => {
      mapChildren.value = await setupMapChildren({
        createFunction: (theme) => new theme.YMapVideoOverlay(props.settings),
        requiredImport: () => importYmapsCDNModule("@yandex/ymaps3-default-ui-theme"),
        settings: computed(() => props.settings)
      });
      emit("update:modelValue", mapChildren.value);
    });
    return () => {
    };
  }
});
export {
  Cartesian,
  WebMercator,
  _sfc_main$H as YandexMap,
  _sfc_main$r as YandexMapCartesianProjection,
  _sfc_main$l as YandexMapClusterer,
  _sfc_main$k as YandexMapCollection,
  _sfc_main$a as YandexMapContextMenu,
  _sfc_main$9 as YandexMapContextMenuItem,
  _sfc_main$w as YandexMapControl,
  _sfc_main$v as YandexMapControlButton,
  _sfc_main$x as YandexMapControls,
  _sfc_main$F as YandexMapDefaultFeaturesLayer,
  _sfc_main$z as YandexMapDefaultMarker,
  _sfc_main$E as YandexMapDefaultSchemeLayer,
  _sfc_main$8 as YandexMapDrawerControl,
  _sfc_main$j as YandexMapEntity,
  YandexMapException,
  _sfc_main$y as YandexMapFeature,
  _sfc_main$C as YandexMapFeatureDataSource,
  _sfc_main$u as YandexMapGeolocationControl,
  _sfc_main$p as YandexMapHint,
  _sfc_main$1 as YandexMapImageOverlay,
  _sfc_main$B as YandexMapLayer,
  _sfc_main$G as YandexMapListener,
  _sfc_main$A as YandexMapMarker,
  _sfc_main$b as YandexMapMiniMap,
  _sfc_main$o as YandexMapOpenMapsButton,
  _sfc_main$2 as YandexMapOverlay,
  _sfc_main$3 as YandexMapPopupMarker,
  _sfc_main$c as YandexMapResizer,
  _sfc_main$f as YandexMapRotateControl,
  _sfc_main$d as YandexMapRotateTiltControl,
  _sfc_main$4 as YandexMapRouteControl,
  _sfc_main$i as YandexMapRuler,
  _sfc_main$s as YandexMapScaleControl,
  _sfc_main$5 as YandexMapSearchControl,
  _sfc_main$7 as YandexMapSignpost,
  _sfc_main$6 as YandexMapSpinner,
  _sfc_main$D as YandexMapTileDataSource,
  _sfc_main$e as YandexMapTiltControl,
  _sfc_main$g as YandexMapTrafficEventsLayer,
  _sfc_main$h as YandexMapTrafficLayer,
  _sfc_main as YandexMapVideoOverlay,
  _sfc_main$q as YandexMapWebMercatorProjection,
  _sfc_main$t as YandexMapZoomControl,
  createYmaps,
  createYmapsOptions,
  deleteMapChildren,
  getBoundsFromCoords,
  getCenterFromCoords,
  getLocationFromBounds,
  importLayersExtra,
  importYmapsCDNModule,
  initYmaps,
  injectMap,
  isYandexMapReadyToInit,
  pixelsToWorld,
  provideMapRoot,
  setupMapChildren,
  worldToPixels,
  yandexMapIsLoaded,
  yandexMapLoadError,
  yandexMapLoadStatus,
  yandexMapScript,
  yandexMapSettings
};
//# sourceMappingURL=vue-yandex-maps.js.map
