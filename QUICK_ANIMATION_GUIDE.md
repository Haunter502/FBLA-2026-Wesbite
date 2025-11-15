# Quick Animation Guide

## 🎨 Using New Animation Components

### 1. Particle Background
Add animated particles to any page:
```tsx
import { ParticleBackground } from '@/components/animations/particle-background'

<ParticleBackground count={30} />
```

### 2. Parallax Effects
Create depth with parallax scrolling:
```tsx
import { ParallaxSection } from '@/components/animations/parallax-section'

<ParallaxSection speed={0.5}>
  <YourContent />
</ParallaxSection>
```

### 3. Glass Cards
Modern glassmorphism cards:
```tsx
import { GlassCard } from '@/components/animations/glass-card'

<GlassCard hover={true} delay={0.2}>
  <YourContent />
</GlassCard>
```

### 4. Animated Statistics
Count-up animations for numbers:
```tsx
import { AnimatedStat } from '@/components/animations/animated-stats'

<AnimatedStat 
  value={5000} 
  label="Students" 
  suffix="+" 
  duration={2}
/>
```

### 5. Toast Notifications
Show notifications:
```tsx
import { toast } from '@/components/animations/toast-notification'

toast('Success!', 'success', 3000)
toast('Error occurred', 'error', 3000)
toast('Info message', 'info', 3000)
toast('Warning', 'warning', 3000)
```

### 6. Confetti Effect
Celebrate achievements:
```tsx
import { ConfettiEffect } from '@/components/animations/confetti-effect'

const [showConfetti, setShowConfetti] = useState(false)

<ConfettiEffect trigger={showConfetti} />
```

### 7. Progress Ring
Animated circular progress:
```tsx
import { ProgressRingAnimated } from '@/components/animations/progress-ring-animated'

<ProgressRingAnimated 
  progress={75} 
  size={120} 
  showLabel={true}
  label="Complete"
/>
```

### 8. Typewriter Effect
Typewriter animation:
```tsx
import { TypewriterEffect } from '@/components/animations/typewriter-effect'

<TypewriterEffect 
  text="Welcome to Numera!" 
  speed={50}
/>
```

## 🎯 CSS Utility Classes

### Animation Classes
- `animate-gradient` - Animated gradient background
- `animate-morph` - Morphing blob effect
- `animate-slide-in-left` - Slide in from left
- `animate-slide-in-right` - Slide in from right
- `animate-scale-in` - Scale and fade in
- `animate-bounce-in` - Bounce entrance
- `animate-neon-glow` - Neon glow text
- `animate-sparkle` - Sparkle effect
- `animate-fade-in-up` - Fade in from bottom

### Effect Classes
- `glass-gradient` - Glassmorphism background
- `hover-lift` - Lift on hover
- `text-gradient-animated` - Animated text gradient
- `card-tilt` - 3D card tilt
- `magnetic` - Magnetic hover effect
- `animate-pulse-glow` - Pulsing glow

### Usage Examples
```tsx
<div className="glass-gradient hover-lift animate-scale-in">
  Content with glass effect
</div>

<h1 className="text-gradient-animated">
  Animated Gradient Text
</h1>

<button className="magnetic hover-lift">
  Magnetic Button
</button>
```

## 🚀 Feature Components

### Feature Showcase
```tsx
import { FeatureShowcase } from '@/components/features/feature-showcase'

<FeatureShowcase />
```

### Stats Showcase
```tsx
import { StatsShowcase } from '@/components/features/stats-showcase'

<StatsShowcase />
```

### Achievement Badge
```tsx
import { AchievementBadge } from '@/components/features/achievement-badge'

<AchievementBadge
  title="First Lesson"
  description="Complete your first lesson"
  unlocked={true}
  onUnlock={() => toast('Achievement unlocked!', 'success')}
/>
```

### Interactive Timeline
```tsx
import { InteractiveTimeline } from '@/components/features/interactive-timeline'

<InteractiveTimeline
  items={[
    {
      title: "Step 1",
      description: "Description",
      completed: true,
      date: "2024-01-01"
    }
  ]}
/>
```

### Testimonial Carousel
```tsx
import { TestimonialCarousel } from '@/components/features/testimonial-carousel'

<TestimonialCarousel
  testimonials={[
    {
      id: '1',
      name: 'John Doe',
      role: 'Student',
      content: 'Great platform!',
      rating: 5
    }
  ]}
  autoPlay={true}
  interval={5000}
/>
```

## 💡 Best Practices

1. **Performance**: Use animations sparingly for key interactions
2. **Accessibility**: Always respect `prefers-reduced-motion`
3. **Loading**: Show loading states with animations
4. **Feedback**: Use animations for user feedback
5. **Celebration**: Use confetti for achievements
6. **Progress**: Show progress with animated rings/bars
7. **Transitions**: Use smooth transitions between states

## 🎨 Color Schemes

The website uses a consistent color palette:
- Primary: Turquoise (#00F2DE)
- Secondary: Teal (#00A799)
- Accent: Dark Teal (#005049)

Gradients are available for:
- Backgrounds
- Text
- Buttons
- Cards
- Borders

## 📱 Responsive Design

All animations are responsive and work on:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## ♿ Accessibility

- Reduced motion support
- Keyboard navigation
- Screen reader friendly
- Focus indicators
- ARIA labels

## 🚀 Performance Tips

1. Use `will-change` sparingly
2. Prefer transform over position changes
3. Use `requestAnimationFrame` for custom animations
4. Debounce scroll events
5. Lazy load heavy animations

## 📚 Examples

See `src/app/page.tsx` for complete implementation examples of all animations and features!


