// CS3110, Lab 5
// Kevin Terceros
// 5078969
/**THIS CODE IS HEAVILY DOCUMENTED FOR THE BENEFIT OF THE PROGRAMMER, WHO IS CURRENTLY IN-TRAINING**/


/*********************** SHADERS ***********************/
// Attribute variables - data differs for each vertex (vshader)
// Uniform variables   - data is the same in each vertex (vshader and fshader)
// Varying variables   - pass data from vshader to fshader (same-named variables)
  
// Vertex shader program - describes position, colours, etc. of a point
var VSHADER_SOURCE =                    // String of vertex shader programs
    'attribute vec4 a_Position;\n' +    // a_Position: vec4 - ??? (data is passed from outside the shader)
    'attribute vec4 a_Color;\n' +       // a_Color: vec4 - Receives colour data
                                        //               - Allows changing of colour
    'uniform mat4 u_MvpMatrix;\n' +     // u_MvpMatrix: mat4 - ModelMat * ProjMat * ViewMat
    'varying vec4 v_Color;\n' +         // v_Color: vec4 - Allows passing value of a_Colour to fshader
    'void main() {\n' +
    '   gl_Position = u_MvpMatrix * a_Position;\n' +    // gl_Position: vec4 - Specifies the position of a vertex
                                                        //                   - Receives data from the outside
                                                        // Apply transformations, projection, view, and modeling on matrix
    '   v_Color = a_Color;\n' +     // Value passing - to vshader
    '}\n';

// Fragment shader program - deals with "per-fragment" processing
// Sets colour of point as a per-fragment operation
var FSHADER_SOURCE =                    // String of fragment shader programs; 
    '#ifdef GL_ES\n' +
    '   precision mediump float;\n' +   // Default precision qualifier
    '#endif\n' +
    'varying vec4 v_Color;\n' +         // u_Color: vec4 - Passes value from vshader to fshader
                                        // Uniform - unchanging image between fragments
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' +    // gl_FragColor: vec4 - Specify the color of a fragment (in RGBA)
    '}\n';
/******************************************************************/

/*********************** DEFAULT SETTUP ***********************/
/*************** Dynamically Changing Variables ***************/
var eyeX = 3, eyeY = 3, eyeZ = 7; // Eye position
var atX = 0, atY = 1, atZ = 0;
var upX = 0, upY = 1, upZ = 0;
var fov = 30, aspectRatio = 1, near = 1, far = 30;

var angle = 0, rX = 1, rY = 0, rZ = 0;
var sX = 1.0, sY = 1.0, sZ = 1.0;
var r = 0.0, g = 0.0, b = 0.0;
/*****************************************/

// Sets up current view (mvpMatrix)
// Effective for starting over with an identity matrix * view variables
function initMvpMatrix(gl, u_MvpMatrix) {
    // Instantiate a new matrix for transforming, view, and projection
    var mvpMatrix = new Matrix4();
    
    // Matrix4.setPerspective(fov, aspectRatio, near, far)
    // fov - Angle formed by top and bottom panes
    // aspectRatio - width / height
    // clipping planes: near, far - far > near > 0
    mvpMatrix.setPerspective(fov, aspectRatio, near, far);    // Set the eye point and the viewing volume

    // Matrix4.lookAt(eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ);
    // eye - Location of eye in relation to scene
    // at - Position of "look-at" point
    // up - Direction of "up"
    mvpMatrix.lookAt(eyeX, eyeY, eyeZ, atX, atY, atZ, upX, upY, upZ);
    
    // Pass the model-view-projection matrix to the vertex shader
    // gl.uniformMatrix4fv(u_location, doTranspose, array)
    // u_location - Storage location of u_variable
    // doTranspose - Matrix transposing is not supported by WebGL
    // array - Contains elements from a Matrix4
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    return mvpMatrix;
}
/******************************************************************/

/*********************** BASIC SHAPE SETTERS ***********************/
/*************** 2D Shapes ***************/
function setSquare() {
    var squareVertices = new Float32Array([
        -1.0,  1.0,     // v0: Top-left
        -1.0, -1.0,     // v1: Bottom-left
         1.0,  1.0,     // v2: Top-Right
         1.0, -1.0,     // v3: Bottom-left
    ]);

    return squareVertices;
}

function setTriangle() {
    var triangleVertices = new Float32Array([
         0.0,  1.0, // v0: top corner
         1.0, -1.0, // v1: bottom-right corner
        -1.0, -1.0  // v0: bottom-left corner
    ]);

    return triangleVertices
}

var vertexCount = 20;   // Number of vertices on circle
function setCircle() {
    var centerX = 0.0;      // X-coordinate of centre of circle
    var centerY = 0.0;      // Y-coordinate of centre of circle
    var radius = 1.0;       // Radius of circle
    
    // equation to set circle:
    var circleData = [];
    for (var i = 0; i <= vertexCount; i++) {
        var angle = i/vertexCount * 2 * Math.PI;
        circleData.push(centerX + radius * Math.cos(angle));
        circleData.push(centerY + radius * Math.sin(angle));
    }

    return new Float32Array(circleData);
}

function set2DColor(arrayLength, r, g, b) {
    var shapeColorData = [];
    for (var i = 0; i < arrayLength; i++)  shapeColorData.push(r, g, b);

    return new Float32Array(shapeColorData);
}
/*****************************************/

/*************** Spheres ***************/
// I got all information in this subsection from the internet; I was not about to derive my own formula for this.
// Source: https://www.youtube.com/watch?v=L89lejZKPIk&list=PLPqKsyEGhUnaOdIFLKvdkXAQWD4DoXnFl&index=80

// Builds raw data used to create generic sphere vertex coordinates
var sphere_div = 15;
function setSphere() {
    var ax, sinx, cosx;
    var ay, siny, cosy;

    // Vertices
    var sphereVData = [];
    for (var y = 0; y <= sphere_div; y++) {
        ay = y * Math.PI / sphere_div;
        siny = Math.sin(ay);
        cosy = Math.cos(ay);
        
        for (var x = 0; x <= sphere_div; x++) {
            ax = x * 2 * Math.PI / sphere_div;
            sinx = Math.sin(ax);
            cosx = Math.cos(ax);

            sphereVData.push(sinx * siny);  // x-coor
            sphereVData.push(cosy);         // y-coor
            sphereVData.push(cosx * siny);  // z-coor
            
        }
    }

    return new Float32Array(sphereVData);
}

// Builds raw data used to set the index coordinates for sphere
function setSphereIndices() {
    var p1, p2;

    var sphereIData = [];
    for (var y = 0; y < sphere_div; y++) {
        for (var x = 0; x < sphere_div; x++) {
            p1 = y * (sphere_div + 1) + x;
            p2 = p1 + (sphere_div + 1);

            sphereIData.push(p1);
            sphereIData.push(p2);
            sphereIData.push(p1 + 1);

            sphereIData.push(p1 + 1);
            sphereIData.push(p2);
            sphereIData.push(p2 + 1);
        }
    }

    return new Uint8Array(sphereIData);
}

// Builds raw data used to set the color for the sphere
function setSphereColor(r, g, b) {
    var selColor = [];
    for (var y = 0; y <= sphere_div; y++) {
        for (var x = 0; x <= sphere_div; x++) {
            selColor.push(r, g, b);
        }
    }

    return new Float32Array(selColor);
}
/*****************************************/

/*************** Cubes ***************/
// Builds raw data used to create vertex coordinates
function setCube() {
    var cubeVertices = new Float32Array([
        1.0,  1.0,  1.0,    // v0: Right-up-near corner,    White
       -1.0,  1.0,  1.0,    // v1: Left-up-near corner,     Magenta
       -1.0, -1.0,  1.0,    // v2: Left-down-near corner,   Red
        1.0, -1.0,  1.0,    // v3: Right-down-near corner,  Blue
        1.0,  1.0, -1.0,    // v4: Right-up-far corner,     Green
       -1.0,  1.0, -1.0,    // v5: Left-up-far corner,      Yellow
       -1.0, -1.0, -1.0,    // v6: Left-down-far corner,    Turquoise
        1.0, -1.0, -1.0,    // v7: Right-down-far corner,   Grey
   ]);

   return cubeVertices;
}

// Builds raw data used to set the index coordinates for cube
function setCubeIndices() {
    var cubeIndices = new Uint8Array([
        0, 1, 2, 0, 2, 3,   // front
        0, 1, 5, 0, 4, 5,   // up
        0, 3, 4, 3, 4, 7,   // right
        1, 2, 6, 1, 5, 6,   // left
        2, 3, 7, 2, 6, 7,   // down
        4, 6, 5, 4, 6, 7,   // back
    ]);

    return cubeIndices;
}

// Builds raw data to set the cube colors
function setCubeColor(r, g, b) {
    var cubeColor = [];
    for (var i = 0; i < 8; i++) cubeColor.push(r, g, b);

    return new Float32Array(cubeColor);
}
/*****************************************/
/******************************************************************/

/*********************** SHAPE DRAWING FUNCTIONS ***********************/
/*************** Initializing Shape-Drawing***************/
// Sets up buffers and attribute values for Float32Array
// ONLY works for Float32Arrays
function arrayAttribBuffer(gl, array, shader_aVar, size, stride) {
    // Create a buffer object (memory) to hold vertices to be drawn
    var arrayBuffer = gl.createBuffer();
    if (!arrayBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    // Write the vertex coordinates and color to the buffer object
    // Object binding code
    // gl.bindBuffer(target, buffer) - Enable and bind buffer object to target
    // ARRAY_BUFFER - buffer object contains vertex data
    gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
    
    // gl.bufferData(gl.target, vertexData, usage) - Allocate storage
    //                                             - usage: What the program is going to do with the data
    // Data passing: vertexData --> target --> buffer
    // STATIC_DRAW  - data specified once, used many times
    // STREAM_DRAW  - data specified once, used a few times
    // DYNAMIC_DRAW - data specified repeatedly, used many times
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
    
    /* "When the vertex shader is passed to the WebGL system, the system parses the shader,
     * recognizes it has an attribute variable, and then prepares the location of its attribute
     * variable so that it can store data values when required."
     * - Textbook, page 71
     */
    
    // Assign the buffer object to a_Position and enable it
    // set the storage location of a_Position, assign and enable buffer
    // Pass data from program to vertex shader
    // gl.getAttribLocation(program, 'a_Position')
    // program - holds vshader and fshader
    var a_Variable = gl.getAttribLocation(gl.program, shader_aVar);
    if (a_Variable < 0) {
        console.log('Failed to set the storage location of a_Position');
        return false;
    }
    
    // Assign a reference to a buffer object to attribute variable
    // Assign vertices (an array of values) to attribute variable
    // gl.vertexAttribPointer(storageLocation, size, dataType, isNormalized, stride, offset)
    // size - Number of components per vertex ()
    // dataType - Correlates with the type of array used
    // isNormalized - true == [0, 1], false == [-1, 1]
    // stride - Number of bytes between vertex data elements (0 for default)
    //        - 6 components per vertex
    // offset - Starting index
    gl.vertexAttribPointer(a_Variable, size, gl.FLOAT, false, stride, 0);
    
    // Enable assignment of buffer object to attribute variable
    // Allows access to buffer object in vertex shader
    // gl.enableVertexAttribArray(storageLocation);
    gl.enableVertexAttribArray(a_Variable);

    return true;
}

// Initiallize all buffers to a given shape
function initVertexBuffers(gl, vertices, indices, colors) {
    var FSIZE = vertices.BYTES_PER_ELEMENT;
    var stride_color = FSIZE * 3;
    var stride_vertices;
    var size_vertices;
    
    var is3D = (indices != null);   // Value of indices will be "null" if shape is 2D
    if (is3D) {
        stride_vertices = FSIZE *3;
        size_vertices = 3;
    } else {
        stride_vertices = 0;
        size_vertices = 2;
    }
    
    var checkInitVertices = arrayAttribBuffer(gl, vertices, 'a_Position', size_vertices, stride_vertices);
    var checkInitColors = arrayAttribBuffer(gl, colors, 'a_Color', 3, stride_color);
    if (!(checkInitVertices && checkInitColors)) {    // Check initialization of triangle vertices
        console.log('Failed to set the positions of the vertices');
        return false;
    }
    
    // Only 3D shapes will have indices
    if (is3D) {
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }
    
    return true;
}
/*****************************************/


/*************** Transformation Functions ***************/
// Apply transformations to mvpMatrix
// Shape appears roughly as expected when translations are done in the given order
function transform(
    gl, Matrix4, u_Matrix4, // General - web_context, matrix, uVar_Shader
    tX, tY, tZ,             // Translation coordinates
    angle, rX, rY, rZ,      // Rotation coordinates
    sX, sY, sZ              // Scale coordinates
) {
    Matrix4.translate(tX, tY, tZ);
    Matrix4.rotate(angle, rX, rY, rZ);  // "angle" is defined in degrees, not radians
    Matrix4.scale(sX, sY, sZ);

    // Apply transformations defined previously to the mvpMatrix
    gl.uniformMatrix4fv(u_Matrix4, false, Matrix4.elements);
}

// Resets shape drawing back to a previous scale (usually default)
function resetScale(matrix4, sX, sY, sZ) {
    matrix4.scale((1 / sX), (1 / sY), (1 / sZ));
    return matrix4;
}

// Resets shape drawing back to a previous orientation (usually default)
function resetRotate(matrix4, angle, rX, rY, rZ) {
    matrix4.rotate((angle * -1), rX, rY, rZ);
    return matrix4;
}

/*****************************************/

// Draw any 2D object with transformations applied
function draw2D(
    gl, Matrix4, u_Matrix4,     // General - web_context, matrix, uVar_Shader
    shapeVertices, isCircle,    // 2D Shape arrays, shapeType
    tX, tY, tZ,                 // Translation coordinates
    angle, rX, rY, rZ,          // Rotation coordinates
    sX, sY, sZ,                 // Scale coordinates
    r, g, b                     // Color
) {
    transform(
        gl, Matrix4, u_Matrix4,
        tX, tY, tZ,
        angle, rX, rY, rZ,
        sX, sY, sZ,
    );

    var colorVertices = set2DColor(shapeVertices.length, r, g, b);
    if (!initVertexBuffers(gl, shapeVertices, null, colorVertices)) {    // check initialization of triangle vertices
        console.log('Failed to set the positions of the square vertices');
        return;
    }
    
    // gl.drawArrays(drawMode, first_vertex, num_vertices);
    if (isCircle) drawMode = gl.TRIANGLE_FAN;
    else          drawMode = gl.TRIANGLE_STRIP;
    gl.drawArrays(drawMode, 0, shapeVertices.length / 2);
}

// Draw any 3D object with transformations applied
function draw3D(
    gl, Matrix4, u_Matrix4,                 // General - web_context, matrix, uVar_Shader
    shapeVertices, shapeIndices, shapeType, // Shape properties
    tX, tY, tZ,                             // Translation coordinates
    angle, rX, rY, rZ,                      // Rotation coordinates
    sX, sY, sZ,                             // Scale coordinates
    r, g, b                                 // Color
) {
    transform(
        gl, Matrix4, u_Matrix4,
        tX, tY, tZ,
        angle, rX, rY, rZ,
        sX, sY, sZ,
    );

    // Set the vertex coordinates and color
    var shapeColor;
    if (shapeType == 'sphere') shapeColor = setSphereColor(r, g, b);
    else if (shapeType == 'cube') shapeColor = setCubeColor(r, g, b);

    if (!initVertexBuffers(gl, shapeVertices, shapeIndices, shapeColor)) {    // check initialization of triangle vertices
        console.log('Failed to set the positions of the sphere vertices');
        return;
    }
    
    // Actual drawing of the shape
    // gl.drawElements(shape, len_shapeIdxArray, usignDataType, offset)
    // shape - Basic shape to be drawn, same options as 2D shapes
    // offset - Starting index
    gl.drawElements(gl.TRIANGLE_STRIP, shapeIndices.length, gl.UNSIGNED_BYTE, 0);
}

/******************************************************************/

/*********************** SPECIFIED DRAWINGS ***********************/
// Draw the ground
function drawGround(gl, mvpMatrix, u_MvpMatrix, square, sphereVertices, sphereIndices) {
    // Draw green plane
    draw2D(
        gl, mvpMatrix, u_MvpMatrix,
        square, isCircle = false,
        tX = 0.0, tY = 0.0, tZ = 0.0,
        angle = 90, rX = 1, rY = 0, rZ = 0,
        sX = 30, sY = 30, sZ = 30,
        r = 0.0, g = 0.8, b = 0.0
    );
    mvpMatrix = resetRotate(mvpMatrix, angle, rX, rY, rZ);
    mvpMatrix = resetScale(mvpMatrix, sX, sY, sZ);

    // Get bushes ready
    transform(
        gl, mvpMatrix, u_MvpMatrix,
        tX = -3.0, tY = 0.4, tZ = 15.0,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 0.5, sY = 0.5, sZ = 0.5
    );

    // Draw bushes (2 rows)
    for (var row = 0; row <= 1; row++) {
        for (var i = 0; i < 15; i++) {
            draw3D(
                gl, mvpMatrix, u_MvpMatrix,
                sphereVertices, sphereIndices, shapeType = 'sphere',
                tX = 0.0, tY = 0.0, tZ = -4.0,
                angle = 0, rX = 1, rY = 0, rZ = 0,
                sX = 1.0, sY = 1.0, sZ = 1.0,
                r = 0.0, g = 0.5, b = 0.25
            );
        }
        
        if (row == 0) mvpMatrix.translate(12.0, 0.0, 60.0);
    }

}

// Draws the blue circles to make up its body and head
// Serves as a base for everything else
function drawMainBody(gl, mvpMatrix, u_MvpMatrix, sphereVertices, sphereIndices) {
    // Draw body
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.0, tY = 0.75, tZ = 0.0,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 0.75, sY = 0.75, sZ = 0.75,
        r = 0.0, g = 0.5, b = 1.0
    );
    
    // Draw head
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.0, tY = 1.3, tZ = 0.0,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 0.6, sY = 0.6, sZ = 0.6,
        r = 0.0, g = 0.5, b = 1.0
    );
}

// Draws all features of hat
function drawHat(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices) {
    // Draw main hat
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.0, tY = 0.6, tZ = 0.0,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 0.9, sY = 0.9, sZ = 0.9,
        r = 1.0, g = 0.0, b = 0.0
    );
    
    // Draw yellow rim on hat
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.0, tY = 0.0, tZ = 0.0,
        angle = 0, rX = 0, rY = 1, rZ = 0,
        sX = 1.3, sY = 0.3, sZ = 1.3,
        r = 1.0, g = 1.0, b = 0.0
    );
    mvpMatrix = resetScale(mvpMatrix, sX, sY, sZ);
    
    // Draw yellow bit up front
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0, tY = 0, tZ = 1.2,
        angle = 10, rX = 1, rY = 0, rZ = 0,
        sX = 0.4, sY = 0.5, sZ = 0.25,
        r = 1.0, g = 1.0, b = 0.0
    );
    mvpMatrix = resetScale(mvpMatrix, sX, sY, sZ);
    mvpMatrix = resetRotate(mvpMatrix, angle, rX, rY, rZ);
    // gl.drawElements(gl.TRIANGLE_STRIP, sphereIndices.length, gl.UNSIGNED_BYTE, 0);

    // Draw white pom-pom
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.0, tY = 1.1, tZ = -1.5,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 0.4, sY = 0.4, sZ = 0.4,
        r = 1.0, g = 1.0, b = 1.0
    );
}

// Draws a single eye
function drawEye(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices) {
    // Draw white eye
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.0, tY = 0.0, tZ = 0.0,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 0.75, sY = 1.0, sZ = 0.25,
        r = 1.0, g = 1.0, b = 1.0
    );

    // Draw black pupil
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.0, tY = 0.0, tZ = 1,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 0.5, sY = 0.6, sZ = 0.5,
        r = 0.0, g = 0.0, b = 0.0
    );
    mvpMatrix = resetScale(mvpMatrix, sX, sY, sZ);
    mvpMatrix = resetScale(mvpMatrix, 0.75, 1.0, 0.25);
    
    // Draw white highlight in eye
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = -0.1, tY = 0.1, tZ = 0.1,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 0.15, sY = 0.15, sZ = 0.05,
        r = 1.0, g = 1.0, b = 1.0
    );
    mvpMatrix = resetScale(mvpMatrix, sX, sY, sZ);
}

// Draws both eyes
function drawEyes(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices) {    
    // Draw right eye
    mvpMatrix.translate(1.0, -3.75, 3.25);
    drawEye(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices);
    
    // Draw left eye
    mvpMatrix.translate(-1.8, -0.05, -0.3);
    drawEye(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices);
    
}

// Draws the triangles for the beak
function drawBeak(gl, mvpMatrix, u_MvpMatrix, triangle) {
    // Draw top half
    draw2D(
        gl, mvpMatrix, u_MvpMatrix,
        triangle, isCircle = false,
        tX = 1.0, tY = -1.5, tZ = 0,
        angle = 80, rX = 1, rY = 0, rZ = 0,
        sX = 2.0, sY = 1.0, sZ = 1.0,
        r = 1.0, g = 0.75, b = 0.0
    );

    // Draw bottom half
    draw2D(
        gl, mvpMatrix, u_MvpMatrix,
        triangle, isCircle = false,
        tX = -0.0, tY = 0.0, tZ = 0.5,
        angle = 30, rX = 1, rY = 0, rZ = 0,
        sX = 1.0, sY = 1.0, sZ = 1.0,
        r = 1.0, g = 0.75, b = 0.0
    );

    mvpMatrix = resetScale(mvpMatrix, 2.0, 1.0, 1.0);
    mvpMatrix = resetRotate(mvpMatrix, 110, rX, rY, rZ);
    
}

// Draw coat
function drawCoat(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices, triangle) {
    // Draw main red coat
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.0, tY = -5.0, tZ = -4.0,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 5.0, sY = 5.0, sZ = 5.0,
        r = 1.0, g = 0.0, b = 0.0
    );
    
    // Draw white part
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0, tY = 0.0, tZ = 0.3,
        angle = -10, rX = 1, rY = 0, rZ = 0,
        sX = 1.1, sY = 1.1, sZ = 0.25,
        r = 1.0, g = 1.0, b = 1.0
    );
    mvpMatrix = resetRotate(mvpMatrix, angle, rX, rY, rZ);
    mvpMatrix = resetScale(mvpMatrix, sX, sY, sZ);

    // Draw front part
    mvpMatrix.rotate(angle = 10, rX = 1, rY = 0, rZ = 0);
    transform(
        gl, mvpMatrix, u_MvpMatrix,
        tX = 0.9, tY = 0.1, tZ = 0.1,           
        angle = 80, rX = 0, rY = 1, rZ = 0,     
        sX = 0.25, sY = 0.5, sZ = 0.25          
    );

    // Triangles
    for (var i = 0; i < 4; i++) {
        transform(
            gl, mvpMatrix, u_MvpMatrix,
            tX = 0.0, tY = 0.0, tZ = 0.0,       
            angle = 180, rX = 1, rY = 0, rZ = 0,
            sX = 1.0, sY = 1.0, sZ = 1.0        
        );
        
        draw2D(
            gl, mvpMatrix, u_MvpMatrix,
            triangle, isCircle = false,
            tX = -1.15, tY = 0.0, tZ = 0.25,
            angle = 19, rX = 0.1, rY = 1, rZ = -0.1,
            sX = 1.0, sY = 1.0, sZ = 1.0,
            r = 1.0, g = 1.0, b = 0.0
        );
        
        transform(
            gl, mvpMatrix, u_MvpMatrix,
            tX = 0.0, tY = 0.0, tZ = 0.0,       
            angle = 180, rX = 1, rY = 0, rZ = 0,
            sX = 1.0, sY = 1.0, sZ = 1.0        
        );

        draw2D(
            gl, mvpMatrix, u_MvpMatrix,
            triangle, isCircle = false,
            tX = -1.15, tY = 0.0, tZ = -0.25,
            angle = -19, rX = -0.1, rY = 1, rZ = 0.0,
            sX = 1.0, sY = 1.0, sZ = 1.0,
            r = 1.0, g = 0.0, b = 0.0
        );
    }

}

// Draw both feet
function drawFeet(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices) {
    // Draw left foot
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = -0.4, tY = 0.0, tZ = 0.2,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 0.3, sY = 0.3, sZ = 0.4,
        r = 1.0, g = 0.75, b = 0.0
    );

    // Draw right foot
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 2.5, tY = 0.0, tZ = 0.0,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 1.0, sY = 1.0, sZ = 1.0,
        r = 1.0, g = 0.75, b = 0.0
    );

    mvpMatrix = resetScale(mvpMatrix, 0.3, 0.3, 0.4);
}

// Draw a cylinder (a single cube rotated many times)
function drawCylinder(
    gl, mvpMatrix, u_MvpMatrix,
    cubeVertices, cubeIndices,
    r, g, b
) {
    for (var i = 0; i < 18; i++) {
        draw3D(
            gl, mvpMatrix, u_MvpMatrix,
            cubeVertices, cubeIndices, shapeType = 'cube',
            tX = 0.0, tY = 0.0, tZ = 0.0,
            angle = 5, rX = 0, rY = 0, rZ = 1,
            sX = 1.0, sY = 1.0, sZ = 1.0,
            r, g, b
        );
    }
    resetRotate(mvpMatrix, angle = 90, rX = 0, rY = 0, sZ = 1);
}

// Draws a single arm and decides on which side to draw it
function drawOneArm(gl, mvpMatrix, u_MvpMatrix, cubeVertices, cubeIndices, sphereVertices, sphereIndices, side) {
    transform(
        gl, mvpMatrix, u_MvpMatrix,
        tX = -0.6, tY = 1.1, tZ = -0.4,
        angle = 90, rX = 0, rY = 1, rZ = 0,
        sX = 0.15, sY = 0.15, sZ = 0.4,
    );
    
    if (side == 'right') tZ = 3;
    else if (side == 'left') tZ = 8;
    
    mvpMatrix.translate(0, 0, tZ);
    
    // Draw main arm
    drawCylinder(
        gl, mvpMatrix, u_MvpMatrix,
        cubeVertices, cubeIndices,
        r = 1.0, g = 0.0, b = 0.0
    );
    
    resetScale(mvpMatrix, sX = 0.15, sY = 0.15, sZ = 0.4);
    resetRotate(mvpMatrix, angle = 90, rX = 0, rY = 1, sZ = 0);
    
    
    // Draw sleeve
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.3, tY = 0.0, tZ = 0.0,
        angle = 5, rX = 0, rY = 0, rZ = 1,
        sX = 0.2, sY = 0.3, sZ = 0.3,
        r = 1.0, g = 1.0, b = 1.0
    );
    resetScale(mvpMatrix, sX, sY, sZ);
    
    
    // Draw hand
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.2, tY = 0.0, tZ = 0.0,
        angle = 5, rX = 0, rY = 0, rZ = 1,
        sX = 0.3, sY, sZ,
        r = 1.0, g = 0.75, b = 0.0
    );
    resetScale(mvpMatrix, sX, sY, sZ);
    
}

// Draw arms
// function drawArms(gl, mvpMatrix, u_MvpMatrix, cylinderVertices, cylinderIndices) {
function drawArms(gl, mvpMatrix, u_MvpMatrix, cubeVertices, cubeIndices, sphereVertices, sphereIndices) {
    // Draw right arm
    drawOneArm(gl, mvpMatrix, u_MvpMatrix, cubeVertices, cubeIndices, sphereVertices, sphereIndices, 'right');
    
    transform(
        gl, mvpMatrix, u_MvpMatrix,
        tX = 0.0, tY = -1.15, tZ = -0.5,
        angle = 180, rX = 0, rY = 1, rZ = 0,
        sX = 1.0, sY = 1.0, sZ = 1.0,
    );
    
    mvpMatrix.rotate(10, 0, 0, 1);

    // Draw left arm
    drawOneArm(gl, mvpMatrix, u_MvpMatrix, cubeVertices, cubeIndices, sphereVertices, sphereIndices, 'left');
}

// Draw pattern on mallet
function drawStarPattern(gl, mvpMatrix, u_MvpMatrix, triangle, circle) {
    // Draw red circle
    draw2D(
        gl, mvpMatrix, u_MvpMatrix,
        circle, isCircle = true,
        tX = 0.0, tY = 0.0, tZ = 0.0,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 1.0, sY = 1.0, sZ = 1.0,
        r = 1.0, g = 0.0, b = 0.0
    );

    // Draw yellow star
    // Top part
    draw2D(
        gl, mvpMatrix, u_MvpMatrix,
        triangle, isCircle = false,
        tX = 0.2, tY = 0.0, tZ = -0.01,
        angle = -90, rX = 0, rY = 0, rZ = 1,
        sX = 0.8, sY = 0.8, sZ = 0.8,
        r = 1.0, g = 1.0, b = 0.0
    );

    // Bottom part
    draw2D(
        gl, mvpMatrix, u_MvpMatrix,
        triangle, isCircle = false,
        tX = 0.0, tY = -0.5, tZ = 0.0,
        angle = 180, rX = 0, rY = 0, rZ = 1,
        sX = 1.0, sY = 1.0, sZ = 1.0,
        r = 1.0, g = 1.0, b = 0.0
    );

    resetScale(mvpMatrix, 0.8, 0.8, 0.8);
}

// Draws the wodden Hammer
function drawMallet(
    gl, mvpMatrix, u_MvpMatrix,
    cubeVertices, cubeIndices,
    triangle, circle
) {
    // Draw handle
    transform(
        gl, mvpMatrix, u_MvpMatrix,
        tX = -1.5, tY = 1.0, tZ = -0.1,
        angle = 90, rX = 1, rY = 0, rZ = 0,
        sX = 0.07, sY = 0.07, sZ = 1.0,
    );

    drawCylinder(
        gl, mvpMatrix, u_MvpMatrix,
        cubeVertices, cubeIndices,
        r = 0.75, g = 0.5, b = 0.0
    );
    resetScale(mvpMatrix, sX = 0.07, sY = 0.07, sZ = 1.0);
    resetRotate(mvpMatrix, angle, rX, rY, rZ);

    // mvpMatrix.scale(2.0, 2.0, 2.0);
    // Draw main part
    transform(
        gl, mvpMatrix, u_MvpMatrix,
        tX = 0.0, tY = 0.0, tZ = -1.5,
        angle = 90, rX = 0, rY = 1, rZ = 0,
        sX = 0.4, sY = 0.4, sZ = 0.5,
    );

    drawCylinder(
        gl, mvpMatrix, u_MvpMatrix,
        cubeVertices, cubeIndices,
        r = 0.75, g = 0.5, b = 0.0
    );
    resetScale(mvpMatrix, sX = 0.4, sY = 0.4, sZ = 0.5);

    // Draw the patterns
    transform(
        gl, mvpMatrix, u_MvpMatrix,
        tX = 0.0, tY = 0.0, tZ = -0.51,
        angle = 0, rX = 0, rY = 1, rZ = 0,
        sX = 0.5, sY = 0.5, sZ = 0.5,
    );
    drawStarPattern(gl, mvpMatrix, u_MvpMatrix, triangle, circle);
    
    transform(
        gl, mvpMatrix, u_MvpMatrix,
        tX = 0.0, tY = -0.1, tZ = 2.04,
        angle = 180, rX = 0, rY = 1, rZ = 0,
        sX = 1.0, sY = 1.0, sZ = 1.0,
    );
    mvpMatrix.rotate(90, 0, 0, 1);
    drawStarPattern(gl, mvpMatrix, u_MvpMatrix, triangle, circle);
    
}
/******************************************************************/

/*********************** GENERIC FUNCTIONS FOR PERSONAL REFERENCE ***********************/
// Generic function to draw things, copy as needed
function drawThing2D(gl, mvpMatrix, u_MvpMatrix, square) {
    // Draw a given 2D thing (square for now)
    draw2D(
        gl, mvpMatrix, u_MvpMatrix,
        square, isCircle = false,
        tX, tY, tZ,
        angle, rX, rY, rZ,
        sX, sY, sZ,
        r, g, b
    );
}

// Generic function to draw 3D objects, copy as needed
function drawThing3D(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices) {
    // Draw a given 3D thing (sphere right now)
    draw3D(
        gl, mvpMatrix, u_MvpMatrix,
        sphereVertices, sphereIndices, shapeType = 'sphere',
        tX = 0.0, tY = 0.0, tZ = 0.0,
        angle = 0, rX = 1, rY = 0, rZ = 0,
        sX = 1.0, sY = 1.0, sZ = 1.0,
        r = 0.0, g = 0.0, b = 0.0
    );
}
/******************************************************************/

/*********************** CRUCIAL FUNCTIONS ***********************/
// Draw EVERYTHING
function drawAll(
    gl, mvpMatrix, u_MvpMatrix,
    square, triangle, circle,
    sphereVertices, sphereIndices,
    cubeVertices, cubeIndices
) {
    // Clear the color and depth buffer
    // clear(buffer [buffer0 | buffer1]) - Can specify multiple buffers with "or" operation
    //                                   - COLOR_BUFFER_BIT clears <canvas> with the specified colour
    //                                   - DEPTH_BUFFER_BIT is used for hidden surface removal
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawGround(gl, mvpMatrix, u_MvpMatrix, square, sphereVertices, sphereIndices);
    mvpMatrix = initMvpMatrix(gl, u_MvpMatrix); // Just reset the matrix
    
    drawMainBody(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices);

    // Draw head features
    drawHat(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices);
    drawEyes(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices);
    drawBeak(gl, mvpMatrix, u_MvpMatrix, triangle);
    
    drawCoat(gl, mvpMatrix, u_MvpMatrix,sphereVertices, sphereIndices, triangle);
    mvpMatrix = initMvpMatrix(gl, u_MvpMatrix); // Just reset the matrix
    
    // Draw appendages
    drawFeet(gl, mvpMatrix, u_MvpMatrix, sphereVertices, sphereIndices);
    drawArms(gl, mvpMatrix, u_MvpMatrix, cubeVertices, cubeIndices, sphereVertices, sphereIndices);
    
    mvpMatrix = initMvpMatrix(gl, u_MvpMatrix); // Just reset the matrix
    drawMallet(
        gl, mvpMatrix, u_MvpMatrix,
        cubeVertices, cubeIndices,
        triangle, circle
    );

}

/*************** View Change Functions ***************/
// Event handler for eye coordnates
function keydown(event) {
    // Change Eye coors - arrow keys
    switch (event.key) {
        case "ArrowRight":  eyeX += 0.1; break;     // Camera moves right   (camera stays focused on focal point)
        case "ArrowLeft":   eyeX -= 0.1; break;     // Camera moves left
        case "ArrowUp":     eyeY += 0.1; break;     // Camera moves up
        case "ArrowDown":   eyeY -= 0.1; break;     // Camera moves down
        case '.':           eyeZ += 0.1; break;     // Camera moves forward
        case ',':           eyeZ -= 0.1; break;     // Camera moves back

        case 'd': atX += 0.1; break;    // Focal point moves right
        case 'a': atX -= 0.1; break;    // Focal point moves left
        case 'w': atY += 0.1; break;    // Focal point moves up
        case 's': atY -= 0.1; break;    // Focal point moves down
        case 'e': atZ += 0.1; break;    // Focal point moves back
        case 'q': atZ -= 0.1; break;    // Focal point moves forward

        case 'l': upX += 0.1; break;    // Camera rotates -clockwise on Z axis
        case 'j': upX -= 0.1; break;    // Camera rotates counter-clockwise on Z axis
        case 'i': upY += 0.1; break;    // Camera flips
        case 'k': upY -= 0.1; break;    // Camera flips
        case 'o': upZ += 0.1; break;    // Camera rotates as it translates
        case 'u': upZ -= 0.1; break;    // Camera rotates as it translates
        
        case 'v': fov += 0.1; break;            // Increase FOV
        case 'V': fov -= 0.1; break;            // Decrease FOV
        case 'r': aspectRatio += 0.1; break;    // Increase aspect ratio (make objects look wider)
        case 'R': aspectRatio -= 0.1; break;    // Decrease aspect ratio (make objects look thinner)
        case 'n': near += 0.1; break;           // Increase near clipping plane
        case 'N': near -= 0.1; break;           // Decrease near clipping plane
        case 'f': far += 0.1; break;            // Increase far clipping plane
        case 'F': far -= 0.1; break;            // Decrease far clipping plane

        default: return false;  // Prevent unnecessary redrawing
    }

    return true;
}

// Developer's lazy text-changing method
function toDisplay(canElement, value, name) {
    canElement.innerHTML += ' | ' + name + ' = ' + Math.round(value * 10) / 10 + ' | ';
}

// Change the text under canvas
function changeDisplay(lookAt, perspective) {
    lookAt.innerHTML = 'Component: ';
    toDisplay(lookAt, eyeX, 'EyeX');
    toDisplay(lookAt, eyeY, 'EyeY');
    toDisplay(lookAt, eyeZ, 'EyeZ');

    toDisplay(lookAt, atX, 'AtX');
    toDisplay(lookAt, atY, 'AtY');
    toDisplay(lookAt, atZ, 'AtZ');

    toDisplay(lookAt, upX, 'UpX');
    toDisplay(lookAt, upY, 'UpY');
    toDisplay(lookAt, upZ, 'UpZ');

    perspective.innerHTML = 'Component: ';
    toDisplay(perspective, fov, 'FOV');
    toDisplay(perspective, aspectRatio, 'Aspect Ratio');
    toDisplay(perspective, near, 'Near');
    toDisplay(perspective, far, 'Far');
}
/*****************************************/
/*************************************************************/

/*************************************************************/
/*************************************************************/
/*********************** MAIN FUNCTION ***********************/
/*************************************************************/
/*************************************************************/

function main() {
    // Retrieve elements from HTML file (argument)
    var canvas = document.getElementById('webgl');
    var lookAt = document.getElementById('lookAt');
    var perspective = document.getElementById('perspective');
    
    // set the rendering context for WebGL
    // getWebGLContext(element, [debug]) - Supports drawing features
    // Defined in "cuon-utils.js"
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to set the rendering context for WebGL');
        return;
    }
    
    // Initialize and set up shaders (check)
    // initShaders(renderContext, vshader: string, fshader: string)
    // Defined in "cuon-util.js"
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders');
        return;
    }
    
    // Pass the model matrix to the vertex shader
    // gl.getUniformLocation(program, uVar_Shader) - Gets storage location of uniform variable
    // uVar_Shader - Uniform variable from v- or f- Shader
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {   // Check initialization of ModelMatrix
        console.log('Failed to set the storage location of u_MvpMatrix');
        return;
    }
    
    // Set up the mvp matrix
    var mvpMatrix = initMvpMatrix(gl, u_MvpMatrix);
    
    // Set the clear color and enable the hidden surface removal
    // Specify the colour for clearing <canvas>
    // clearColor(r, g, b, a (transparency))
    gl.clearColor(r = 0.0, g = 1.0, b = 1.0, a = 0.5);

    // Enable hidden surface removal function
    // enable(DT) is to DBB as clearColor(r, g, b, a) is to CBB
    gl.enable(gl.DEPTH_TEST);
    
    // set 2D shapes
    var square = setSquare();
    var triangle = setTriangle();
    var circle = setCircle();
    
    // set sphere
    var sphereVertices = setSphere();
    var sphereIndices = setSphereIndices();

    // set Cube
    var cubeVertices = setCube();
    var cubeIndices = setCubeIndices();
    
    drawAll(
        gl, mvpMatrix, u_MvpMatrix,
        square, triangle, circle,
        sphereVertices, sphereIndices,
        cubeVertices, cubeIndices
    );
    
    // Insert event handlers
    document.onkeydown = function(event) {
        var goodKeyPress = keydown(event);     // Read key press

        // Determine whether redrawing will actually happen
        if (goodKeyPress) {
            mvpMatrix = initMvpMatrix(gl, u_MvpMatrix);     // Reset mvpMatrix
            changeDisplay(lookAt, perspective);

            // Redraw everything
            drawAll(
                gl, mvpMatrix, u_MvpMatrix,
                square, triangle, circle,
                sphereVertices, sphereIndices,
                cubeVertices, cubeIndices
            );
        }
    };
}