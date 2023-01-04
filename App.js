import React from 'react';
import {GLView} from 'expo-gl';
import {Renderer, TextureLoader, THREE} from 'expo-three';
import {Alert, PixelRatio, TouchableWithoutFeedback, View} from 'react-native';

// This texture will be immediately read, but it'll load asynchronously
const textureSphere = new TextureLoader().load(require('./texture-sphere.jpg'));
const textureIcon1 = new TextureLoader().load(require('./texture-icon-1.png'));
const textureIcon2 = new TextureLoader().load(require('./texture-icon-2.png'));
const textureIcon3 = new TextureLoader().load(require('./texture-icon-3.png'));
const textureIcon4 = new TextureLoader().load(require('./texture-icon-4.png'));
const textureIcon5 = new TextureLoader().load(require('./texture-icon-5.png'));
const textureSceneBackground = new TextureLoader().load(
  require('./texture-scene-background.jpg'),
);
const textureStar = new TextureLoader().load(require('./texture-star.png'));

global.THREE = global.THREE || THREE;

const glViewStyle = {
  height: '100%',
  width: '100%',
};
const viewStyle = {
  height: '100%',
  width: '100%',
};

const navigationItems = [
  {
    name: 'Bitcoin',
    position: {
      x: 0,
      y: -6,
      z: 368,
    },
    texture: textureIcon1,
  },
  {
    name: 'Card',
    position: {
      x: -20,
      y: -4,
      z: 304,
    },
    texture: textureIcon2,
  },
  {
    name: 'Currency',
    position: {
      x: 20,
      y: -4,
      z: 304,
    },
    texture: textureIcon3,
  },
  {
    name: 'Target',
    position: {
      x: -28,
      y: 4,
      z: 272,
    },
    texture: textureIcon4,
  },
  {
    name: 'Digital innovation',
    position: {
      x: 28,
      y: 4,
      z: 272,
    },
    texture: textureIcon5,
  },
];

let camera = null;
let context = null;
let trackedObjects = [];
let pointer = null;
let raycaster = null;

export default function App() {
  function handlePress(event) {
    const pointerX =
      (event.nativeEvent.locationX /
        (context.drawingBufferWidth / PixelRatio.get())) *
        2 -
      1;
    const pointerY =
      -(
        event.nativeEvent.locationY /
        (context.drawingBufferHeight / PixelRatio.get())
      ) *
        2 +
      1;
    pointer.set(pointerX, pointerY);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(trackedObjects, false);

    if (intersects.length) {
      const name = intersects[0].object.name;
      const navigationItem = navigationItems.find(
        navigationItem => navigationItem.name === name,
      );

      if (navigationItem) {
        Alert.alert(`Interaction will lead to "${name}" screen`);
      }
    } else {
      Alert.alert('Not a sphere!');
    }
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={viewStyle}>
        <GLView onContextCreate={onContextCreate} style={glViewStyle} />
      </View>
    </TouchableWithoutFeedback>
  );

  async function onContextCreate(gl) {
    context = gl;

    camera = new THREE.PerspectiveCamera(
      45,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      1,
      1024,
    );
    camera.position.set(0, 0, 512);

    const ambientLight = new THREE.AmbientLight('#ffffff', 1);
    ambientLight.position.set(0, 32, 32);

    const directionalLight1 = new THREE.DirectionalLight('#ffffff', 1);
    directionalLight1.position.set(16, 32, 32);
    const directionalLight2 = new THREE.DirectionalLight('#ffffff', 2);
    directionalLight2.position.set(-16, -32, -32);

    const renderer = new Renderer({gl});
    renderer.setClearColor('#000000');
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const scene = new THREE.Scene();
    scene.background = textureSceneBackground;
    setSceneBackground({
      backgroundImage: {
        height: 2160,
        width: 3840,
      },
      gl,
      scene,
    });

    const starsCount = 256;
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      alphaMap: textureStar,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.6,
      size: 4.6,
      transparent: true,
    });

    const positions = new Float32Array(starsCount * 3);
    const starsVectors = [];

    for (let i = 0; i < starsCount; i++) {
      const vector = getStarVector();

      vector.startX = vector.x;
      vector.startY = vector.y;
      vector.startZ = vector.z;
      vector.velocity = THREE.MathUtils.randInt(32, 512);

      starsVectors.push(vector);
    }

    let positionIndex = 0;

    for (let i = 0, l = starsCount; i < l; i++) {
      positions[positionIndex++] = starsVectors[i].x;
      positions[positionIndex++] = starsVectors[i].y;
      positions[positionIndex++] = starsVectors[i].z;
    }

    starsGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    );

    const sphereGeometry = new THREE.SphereGeometry(32, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      map: textureSphere,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const normal = sphere.geometry.getAttribute('normal');
    const position = sphere.geometry.getAttribute('position');
    const sphereNormalClone = JSON.parse(JSON.stringify(normal.array));
    const spherePositionClone = JSON.parse(JSON.stringify(position.array));
    sphere.castShadow = true;
    sphere.name = 'sphere';
    sphere.receiveShadow = true;
    sphere.rotation.x = Math.PI / 2;
    sphere.rotation.z = Math.PI / 2;
    sphere.position.z = 112;
    trackedObjects.push(sphere);

    const stars = new THREE.Points(starsGeometry, starsMaterial);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    const orbit = new THREE.Group();
    const clock = new THREE.Clock();

    scene.add(ambientLight);
    scene.add(directionalLight1);
    scene.add(directionalLight2);
    scene.add(sphere);
    scene.add(stars);

    const navigationItemsMeshes = navigationItems.map(navigationItem => {
      const geometry = new THREE.CircleGeometry(10, 32);
      const material = new THREE.MeshBasicMaterial({
        map: navigationItem.texture,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.name = navigationItem.name;
      mesh.position.x = navigationItem.position.x;
      mesh.position.y = navigationItem.position.y;
      mesh.position.z = navigationItem.position.z;

      return mesh;
    });

    navigationItemsMeshes.forEach(navigationItemMesh => {
      trackedObjects.push(navigationItemMesh);
      scene.add(navigationItemMesh);
    });

    render();

    function render() {
      animateSphere();
      animateStars();

      const time = clock.getElapsedTime();

      navigationItemsMeshes.forEach((navigationItemMesh, index) => {
        navigationItemMesh.position.y += Math.cos(time) * 0.08;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(render);

      gl.flush();
      gl.endFrameEXP();
    }

    function animateSphere() {
      const damping = 1.6;
      const now = Date.now() / 512;
      const position = sphere.geometry.getAttribute('position');

      for (let i = 0; i < position.count; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        const uX = sphere.geometry.attributes.uv.getX(i) * Math.PI * 8;
        const uY = sphere.geometry.attributes.uv.getY(i) * Math.PI * 8;

        const xangle = uX + now;
        const xsin = Math.sin(xangle) * damping;
        const yangle = uY + now;
        const ycos = Math.cos(yangle) * damping;

        sphere.geometry.attributes.position.setX(
          i,
          spherePositionClone[ix] + sphereNormalClone[ix] * (xsin + ycos),
        );
        sphere.geometry.attributes.position.setY(
          i,
          spherePositionClone[iy] + sphereNormalClone[iy] * (xsin + ycos),
        );
        sphere.geometry.attributes.position.setZ(
          i,
          spherePositionClone[iz] + sphereNormalClone[iz] * (xsin + ycos),
        );
      }

      sphere.geometry.attributes.position.needsUpdate = true;
    }

    function animateStars() {
      starsVectors.forEach(vector => {
        vector.x += (0 - vector.x) / vector.velocity;
        vector.y += (0 - vector.y) / vector.velocity;
        vector.z += (0 - vector.z) / vector.velocity;
        vector.velocity -= 0.2;

        if (
          vector.x <= 4 &&
          vector.x >= -4 &&
          vector.z <= 4 &&
          vector.z >= -4
        ) {
          vector.x = vector.startX;
          vector.y = vector.startY;
          vector.z = vector.startZ;
          vector.velocity = THREE.MathUtils.randInt(32, 512);
        }
      });

      const positions = stars.geometry.attributes.position.array;
      let positionIndex = 0;

      for (let i = 0, l = starsCount; i < l; i++) {
        positions[positionIndex++] = starsVectors[i].x;
        positions[positionIndex++] = starsVectors[i].y;
        positions[positionIndex++] = starsVectors[i].z;
      }

      stars.geometry.attributes.position.needsUpdate = true;

      stars.rotation.z += 0.004;
    }
  }
}

function getStarVector(radius = 128) {
  let theta = 2 * Math.PI * Math.random();
  let phi = Math.acos(2 * Math.random() - 1);
  let dx = radius * Math.sin(phi) * Math.cos(theta);
  let dy = radius * Math.sin(phi) * Math.sin(theta);
  let dz = radius * Math.cos(phi);

  return new THREE.Vector3(dx, dy, dz);
}

function setSceneBackground({backgroundImage, gl, scene}) {
  if (scene.background) {
    const factor =
      backgroundImage.width /
      backgroundImage.height /
      (gl.drawingBufferWidth / gl.drawingBufferHeight);

    scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
    scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;

    scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
    scene.background.repeat.y = factor > 1 ? 1 : factor;
  }
}
