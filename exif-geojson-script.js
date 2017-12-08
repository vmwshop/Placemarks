var ExifImage = require('exif').ExifImage;
var fs = require('fs');
var path = require('path');
var process = require("process");
// var line = {
// 	type: "Feature",
// 	properties: {},
// 	geometry: {
// 		type: "LineString",
// 		coordinates: []
// 	}
// }
var geo = {
	type: "FeatureCollection",
	features: []
};
var exifArray = [];
var imageDir = "/Users/sam/Documents/DHRX/Placemarks/ExifMapUtilsandPrototypes/PlaceMarks";
var cameraArray = [];
var colors = ["#d3324e", "#d3d24e", "#d332de", "#23d24e", "#1332fe"];

function degreesToDecimal(gpsLatLon) {
    var d = gpsLatLon[0];
    var m = gpsLatLon[1];
    var s = gpsLatLon[2];
    return d + (m/60.0) + (s/3600.0);
}

function getImageDataFromDir(dir, firstDir) {
	fs.readdir( dir, function( err, files ) {
	    if( err ) {
	        console.error( "Could not list the directory.", err );
	        process.exit( 1 );
	    } 
	    files.forEach( function( file, index ) {
            // Make one pass and make the file complete
            var fromPath = path.join( dir, file );
            fs.stat( fromPath, function( error, stat ) {
                if( error ) {
                    console.error( "Error stating file.", error );
                    return;
                }
                if( stat.isFile() ){
                    // console.log( "'%s' is a file.", fromPath );
                        try {
					    new ExifImage({ image : fromPath }, function (error, exifData) {
					        if (error){
					            console.log('Error: ' + error.message);
					        }
					        else {
					        	readExifData(exifData, fromPath);
					        }
					            // console.log(exifData); // Do something with your data! 
					    });
					} catch (error) {
					    console.log('Error: ' + error.message);
					}
				}
                else if( stat.isDirectory() ) {
                    getImageDataFromDir(fromPath, false);
                }
            });
            if(index == files.length-1) {
            	exportData();
            }
	    });
	    
	});
}

function readExifData(exifData, fromPath) {
	var lat, lon;
	if(exifData.gps.GPSLatitude && exifData.gps.GPSLongitude) {
    	lat = degreesToDecimal(exifData.gps.GPSLatitude);
    	if(exifData.gps.GPSLatitudeRef == 'S') {
    		lat *= -1;
    	}
    	lon = degreesToDecimal(exifData.gps.GPSLongitude);
    	if(exifData.gps.GPSLongitudeRef == 'W') {
    		lon *= -1;
    	}
        

    	var feature = {
    		type: 'Feature',
    		properties: {
    			name: fromPath,
    			cameraType: exifData.image.Make + ' ' + exifData.image.Model,
    			timestamp: exifData.image.ModifyDate
    		},
    		geometry: {
    			type: "Point",
    			coordinates: [
    				lon,
    				lat
    			]
    		}
    	};
    	var cameraNotInArray = true;
    	cameraArray.forEach((element, i) => {
    		if(element == feature.properties.cameraType){
    			cameraNotInArray = false;
    		}
    	});
    	if(cameraNotInArray) {
    		cameraArray.push(feature.properties.cameraType);
    	}

    	// line.geometry.coordinates.push([lon,lat]);

    	geo.features.push(feature);
    	if(index == files.length-1) {
    		
    	}
    }
}

function exportData() {
	geo.features.sort((a, b) => {
		return a.properties.timestamp > b.properties.timestamp ? 1 : -1;
	});
	
	cameraArray.forEach((cType, i) => {
		var line = {
			type: "Feature",
			properties: {
				"stroke": colors[i],
				"stroke-width": 2,
				"stroke-opacity": 1
			},
			geometry: {
				type: "LineString",
				coordinates: []
			}
		};
		geo.features.forEach((feat) => {
			if(feat.properties.cameraType == cType){
	        		line.geometry.coordinates.push(feat.geometry.coordinates);
			}
		});
		geo.features.push(line);
		
	});
	
	console.log(exifArray);
    fs.writeFile("/Users/sam/Documents/DHRX/Placemarks/ExifMapUtilsandPrototypes/exif.geojson", JSON.stringify(geo, null, 4), function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("File was saved");
	});
}


// fs.readdir( imageDir, function( err, files ) {
//     if( err ) {
//         console.error( "Could not list the directory.", err );
//         process.exit( 1 );
//     } 

//     files.forEach( function( file, index ) {
//             // Make one pass and make the file complete
//             var fromPath = path.join( imageDir, file );
//             fs.stat( fromPath, function( error, stat ) {
//                 if( error ) {
//                     console.error( "Error stating file.", error );
//                     return;
//                 }

//                 if( stat.isFile() ){
//                     // console.log( "'%s' is a file.", fromPath );
//                         try {
// 					    new ExifImage({ image : fromPath }, function (error, exifData) {
// 					        if (error){
// 					            console.log('Error: ' + error.message);
// 					        }
// 					        else {
// 					        	var lat, lon;
// 					        	if(exifData.gps.GPSLatitude && exifData.gps.GPSLongitude) {
// 						        	lat = degreesToDecimal(exifData.gps.GPSLatitude);
// 						        	if(exifData.gps.GPSLatitudeRef == 'S') {
// 						        		lat *= -1;
// 						        	}
// 						        	lon = degreesToDecimal(exifData.gps.GPSLongitude);
// 						        	if(exifData.gps.GPSLongitudeRef == 'W') {
// 						        		lon *= -1;
// 						        	}
							        

// 						        	var feature = {
// 						        		type: 'Feature',
// 						        		properties: {
// 						        			name: './PlaceMarks/' + file,
// 						        			cameraType: exifData.image.Make + ' ' + exifData.image.Model,
// 						        			timestamp: exifData.image.ModifyDate
// 						        		},
// 						        		geometry: {
// 						        			type: "Point",
// 						        			coordinates: [
// 						        				lon,
// 						        				lat
// 						        			]
// 						        		}
// 						        	};
// 						        	var cameraNotInArray = true;
// 						        	cameraArray.forEach((element, i) => {
// 						        		if(element == feature.properties.cameraType){
// 						        			cameraNotInArray = false;
// 						        		}
// 						        	});
// 						        	if(cameraNotInArray) {
// 						        		cameraArray.push(feature.properties.cameraType);
// 						        	}

// 						        	// line.geometry.coordinates.push([lon,lat]);

// 						        	geo.features.push(feature);
// 						        	if(index == files.length-1) {
// 						        		geo.features.sort((a, b) => {
// 						        			return a.properties.timestamp > b.properties.timestamp ? 1 : -1;
// 						        		});
// 						        		cameraArray.forEach((cType, i) => {
// 						        			var line = {
// 												type: "Feature",
// 												properties: {
// 													"stroke": colors[i],
// 													"stroke-width": 2,
// 													"stroke-opacity": 1
// 												},
// 												geometry: {
// 													type: "LineString",
// 													coordinates: []
// 												}
// 											};
// 							        		geo.features.forEach((feat) => {
// 							        			if(feat.properties.cameraType == cType){
// 							   		        		line.geometry.coordinates.push(feat.geometry.coordinates);
// 							        			}
// 							        		});
// 							        		geo.features.push(line);
							        		
// 							        	});
						        		
// 						        		console.log(exifArray);
// 									    fs.writeFile("/Users/sam/Documents/DHRX/Placemarks/ExifMapUtilsandPrototypes/exif.geojson", JSON.stringify(geo, null, 4), function(err) {
// 											if(err) {
// 												return console.log(err);
// 											}
// 											console.log("File was saved");
// 										});
// 						        	}
// 						        }
// 					        }
// 					            // console.log(exifData); // Do something with your data! 
// 					    });
// 					} catch (error) {
// 					    console.log('Error: ' + error.message);
// 					}
// 				}
//                 else if( stat.isDirectory() ) {
//                     console.log( "'%s' is a directory.", fromPath );
//                 }
//             } );
//     });
    
// });





