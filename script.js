L.mapbox.accessToken = 'pk.eyJ1IjoiaWtrb2IiLCJhIjoiY2twMmY3b3prMWpvYjJvbXczdzk0OHF1ZSJ9.6j0RtV05VwqttLIR0RfWJg';
var map = L.mapbox.map('map')
    .setView([37.8, -96], 4)
    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'));

var getDataJson = async function () {
    const url = 'https://raw.githubusercontent.com/lulumalik/choropleth/master/public/us.json';
    const res = await fetch(url);
    const data = await res.json();
    // console.log(data);

    L.geoJson(data, {
        style: getStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

}

getDataJson();

function getStyle(feature) {
    return {
        weight: 2,
        opacity: 0.2,
        color: 'black',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.density)
    };
}

// dens for density
function getColor(dens) {
    return dens > 1000 ? '#005E36' :
        dens > 500 ? '#008256' :
            dens > 200 ? '#329E70' :
                dens > 100 ? '#52BA8A' :
                    dens > 50 ? '#70D8A6' :
                        dens > 20 ? '#77DFAD' :
                            dens > 10 ? '#8DF6C2' :
                                '#A5FFD9';
}

function onEachFeature(feature, layer) {
    layer.on({
        click: openDetail
    });
}


function openDetail(e) {
    var layer = e.target;

    // layer.setStyle({
    //     weight: 3,
    //     opacity: 0.3,
    //     fillOpacity: 0.9
    // });


    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);


}


// custom card detail 
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// update control properties
info.update = function (property) {
    this._div.innerHTML = '<h4>US Population Density</h4>' + (property ?
        '<b>' + property.name + '</b><br />' + property.density + ' people / mi<sup>2</sup>'
        : 'Click over a state');
};

info.addTo(map);



//Layer Control
L.control.layers({
    'Mapbox Streets': L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11').addTo(map),
    'Mapbox Light': L.mapbox.styleLayer('mapbox://styles/mapbox/light-v10'),
    'Mapbox Outdoors': L.mapbox.styleLayer('mapbox://styles/mapbox/outdoors-v11')
}).addTo(map);




