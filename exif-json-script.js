var ExifImage = require('exif').ExifImage;
var fs = require('fs');
var path = require('path');
var process = require("process");
var exifArray = [];
var imageDir = "/Users/sam/Documents/DHRX/Placemarks/GoogleclusteringEX/PlaceMarks";

fs.readdir( imageDir, function( err, files ) {
    if( err ) {
        console.error( "Could not list the directory.", err );
        process.exit( 1 );
    } 

    files.forEach( function( file, index ) {
            // Make one pass and make the file complete
            var fromPath = path.join( imageDir, file );
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
					            console.log('Error: '+error.message);
					        }
					        else {
					        	var imageData = {
					        		imagePath: './PlaceMarks/' + file,
					        		exif: exifData
					        	};
					        	exifArray.push(imageData);
					        	if(index == files.length-1) {
					        		console.log(exifArray);
								    fs.writeFile("/Users/sam/Documents/DHRX/Placemarks/GoogleclusteringEX/exifall.json", JSON.stringify(exifArray, null, 4), function(err) {
										if(err) {
											return console.log(err);
										}
										console.log("File was saved");
									});
					        	}
					        }
					            // console.log(exifData); // Do something with your data! 
					    });
					} catch (error) {
					    console.log('Error: ' + error.message);
					}
				}
                else if( stat.isDirectory() ) {
                    console.log( "'%s' is a directory.", fromPath );
                }
            } );
    });
    
});





