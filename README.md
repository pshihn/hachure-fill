# hachure-fill

This package calculates the lines needed to fill a polygon (hachure lines). The **angle** of the lines and the **gap** between lines can be configured.

![preview of a polygon](https://user-images.githubusercontent.com/833927/80780860-4d96ca00-8b25-11ea-9bd5-8c1e9abb0de6.png)


## Install

From npm

```
npm install --save hachure-fill
```

The package is distributed as an ES6 module. 

## Usage

### hachureFill(points: Point[], angle?: number, gap?: number): Line[];

The function takes in an array of points. A point (each point being a an array of 2 numbers `[x, y]`). One can optionally pass in the angle of the hachure lines, and the gap between the lines. Default value of angle is `0` and of the gap is `5`.

The function returns an array of lines. Each line is an array of two points. 

```javascript
import { hachureFill } from '../index.js';

// Polygon vertices
const vertices = [
  [10, 10],
  [200, 10],
  [100, 100],
  [300, 100],
  [60, 200]
];

// horizontal lines filling the polygon
let lines = hachureFill(vertices);

// Lines at 45 degrees filling the polugon. 
// Distance between each line is 3px
lines = hachureFill(vertices, 45, 3);
```
