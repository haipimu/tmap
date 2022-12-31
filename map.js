
      require(["esri/config", "esri/Map", "esri/views/MapView","esri/layers/GeoJSONLayer",
      "esri/widgets/LayerList","esri/geometry/SpatialReference","esri/Basemap",
      "esri/layers/GraphicsLayer","esri/Graphic","esri/widgets/BasemapToggle","esri/widgets/Legend","esri/layers/FeatureLayer"], (
        esriConfig, Map, MapView,GeoJSONLayer,LayerList,SpatialReference,Basemap,GraphicsLayer,Graphic,BasemapToggle,Legend,FeatureLayer
      ) => {
        esriConfig.apiKey = "AAPK449340f85b664e6b802d2d0e65eb4849vlSII8YqKpEj5Fn0hCy2qr4QyOAZRZSB6XWDc2-X8pFlNoRYoQoetUvFs1Y_JVKL";
        

        const rotationRenderer = {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: {
              type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
              // use an SVG path to create an arrow shape
              path: "M14.5,29 23.5,0 14.5,9 5.5,0z",
              color: "#DC143C",
              outline: {
                color: [255, 0, 0, 1],
                width: 0.5
              },
              // since the arrow points down, you can set the angle to 180
              // to force it to point up (0 degrees North) by default
              angle: 180,
              size: 20
            }

          };


        const hurricanesLayer = new GeoJSONLayer({
          url: "https://haipimu.github.io/tmap/POINT.geojson",
          outFields: ["*"],
          title: "changZheng",
          renderer: rotationRenderer
        });

        const LineLayer = new GeoJSONLayer({
          url: "https://haipimu.github.io/tmap/Line.geojson",
          outFields: ["*"],
          title: "changZheng Road",
          
        });

        const map = new Map({
          basemap: "arcgis-topographic",
          layers: [hurricanesLayer,LineLayer],
        });


        const view = new MapView({
          container: "viewDiv",
          map: map,
          center: [118, 30],
          zoom: 4,
          highlightOptions: {
            color: "orange"
          }
        });

        view.ui.add("info", "top-right");

        const basemapToggle = new BasemapToggle({
                view: view,
                nextBasemap: "arcgis-imagery"
            });
            view.ui.add(basemapToggle,"bottom-right");


        let layerList = new LayerList({
          view: view
          });
          
          // Adds widget below other elements in the top left corner of the view
          view.ui.add(layerList, {
          position: "top-left"
          });

        view
          .when()
          .then(() => {
            return hurricanesLayer.when();
          })
          .then((layer) => {
            const renderer = layer.renderer.clone();
            renderer.symbol.width = 4;
            renderer.symbol.color = [128, 128, 128, 0.8];
            layer.renderer = renderer;

            // Set up an event handler for pointer-down (mobile)
            // and pointer-move events (mouse)
            // and retrieve the screen x, y coordinates

            return view.whenLayerView(layer);
          })
          .then((layerView) => {
            view.on("pointer-move", eventHandler);
            view.on("pointer-down", eventHandler);

            function eventHandler(event) {
              // only include graphics from hurricanesLayer in the hitTest
              const opts = {
                include: hurricanesLayer
              };
              // the hitTest() checks to see if any graphics from the hurricanesLayer
              // intersect the x, y coordinates of the pointer
              view.hitTest(event, opts).then(getGraphics);
            }

            let highlight, currentYear, currentName;

            function getGraphics(response) {
              // the topmost graphic from the hurricanesLayer
              // and display select attribute values from the
              // graphic to the user
              if (response.results.length) {
                const graphic = response.results[0].graphic;

                const attributes = graphic.attributes;

                const name = attributes.name;
                const step = attributes.step;


                if (
                  highlight &&
                  (currentName !== name || currentYear !== step)
                ) {
                  highlight.remove();
                  highlight = null; 
                  return;
                }

                if (highlight) {
                  return;
                }

                document.getElementById("info").style.visibility = "visible";
                document.getElementById("name").innerHTML = "地点: "+ name;
                document.getElementById("step").innerHTML ="顺序: "+ step;


                // highlight all features belonging to the same hurricane as the feature
                // returned from the hitTest
                const query = layerView.createQuery();
                query.where = "step = " + step + " AND NAME = '" + name + "'";
                layerView.queryObjectIds(query).then((ids) => {
                  if (highlight) {
                    highlight.remove();
                  }
                  highlight = layerView.highlight(ids);
                  currentYear = step;
                  currentName = name;
                });
              } else {
                // remove the highlight if no features are
                // returned from the hitTest
                if (highlight) {
                  highlight.remove();
                  highlight = null;
                }
                document.getElementById("info").style.visibility = "hidden";
              }
            }
          });
      });

      function load_home() {
        document.getElementById("viewDiv").innerHTML = '<object type="text/html" data="C:\Users\asdachuang\Desktop\新建文件夹 (4)\新建文件夹\work.html" width="100%" height="100%"></object>';
          }
