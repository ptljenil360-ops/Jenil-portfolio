import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'

// Simple stylized "humanoid" built from primitives (no external model needed)
function Humanoid({ scrollProgress }: { scrollProgress: number }) {
  const group = useRef<THREE.Group>(null!)

  useFrame(() => {
    if (!group.current) return
    // subtle idle + scroll-driven motion
    group.current.rotation.y = scrollProgress * Math.PI * 1.5
    group.current.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.2
    group.current.position.y = Math.sin(scrollProgress * Math.PI * 2) * 0.3 - 0.5
  })

  return (
    <group ref={group} position={[0, -0.5, 0]}>
      {/* head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* torso */}
      <mesh position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.35, 1.1, 8, 16]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>

      {/* left arm */}
      <group position={[-0.6, 0.9, 0]} rotation={[0, 0, 0.2]}>
        <mesh position={[0, -0.6, 0]}>
          <capsuleGeometry args={[0.15, 0.9, 8, 16]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      </group>

      {/* right arm */}
      <group position={[0.6, 0.9, 0]} rotation={[0, 0, -0.2]}>
        <mesh position={[0, -0.6, 0]}>
          <capsuleGeometry args={[0.15, 0.9, 8, 16]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      </group>

      {/* left leg */}
      <mesh position={[-0.25, -0.6, 0]}>
        <capsuleGeometry args={[0.18, 1.1, 8, 16]} />
        <meshStandardMaterial color="#bbbbbb" />
      </mesh>

      {/* right leg */}
      <mesh position={[0.25, -0.6, 0]}>
        <capsuleGeometry args={[0.18, 1.1, 8, 16]} />
        <meshStandardMaterial color="#bbbbbb" />
      </mesh>
    </group>
  )
}

function Particles({ scrollProgress }: { scrollProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null!)
  const count = 1500

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12
    }
    return arr
  }, [])

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = scrollProgress * Math.PI * 0.8
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#ffffff" transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

function CameraController({ scrollProgress }: { scrollProgress: number }) {
  useFrame(({ camera }) => {
    camera.position.z = 5 - scrollProgress * 2
    camera.position.y = scrollProgress * 1.5
    camera.lookAt(0, 0.5, 0)
  })
  return null
}

export default function ParticlesPreview() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.body.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ height: '300vh', background: 'black', color: 'white' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh' }}>
        <Canvas>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 3, 5]} intensity={1.2} />

          <Particles scrollProgress={scrollProgress} />
          <Humanoid scrollProgress={scrollProgress} />
          <CameraController scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', position: 'relative', zIndex: 1 }}>
        Human-like 3D Object
      </div>

      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', position: 'relative', zIndex: 1 }}>
        Scroll Controlled Motion
      </div>

      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', position: 'relative', zIndex: 1 }}>
        Cinematic Feel
      </div>
    </div>
  )
}
