<template>
  <div class="home-container">
    <div class="home-wrapper">
      <div class="home-left">
        <div class="home-content">
          <h1 class="home-title">Diabetes Support System</h1>
          <p class="home-subtitle">Your comprehensive health companion for diabetes management</p>



          <div class="cta-section">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of users managing their diabetes effectively</p>
            <div class="cta-buttons">
              <router-link to="/login" class="cta-btn primary">Sign In</router-link>
              <router-link to="/register" class="cta-btn secondary">Create Account</router-link>
              <router-link to="/admin-login" class="cta-btn admin">Admin Access</router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="home-right">
        <div class="image-container">
          <img src="@/assets/home.png" alt="Diabetes Support" class="home-image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Homepage from '../components/Homepage.vue'
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.home-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  max-width: 1200px;
  width: 100%;
  min-height: 600px;
}

.home-left {
  flex: 1;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-content {
  width: 100%;
  max-width: 500px;
}

.home-title {
  font-size: 3rem;
  font-weight: 800;
  color: #0b2540;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.home-subtitle {
  color: #6c757d;
  font-size: 1.2rem;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: #0d6efd;
  box-shadow: 0 10px 25px rgba(13, 110, 253, 0.1);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.feature-icon i {
  font-size: 1.5rem;
  color: white;
}

.feature-card h3 {
  color: #0b2540;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.cta-section {
  text-align: center;
  background: linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%);
  padding: 2rem;
  border-radius: 16px;
  border: 2px solid #b3d9ff;
}

.cta-section h2 {
  color: #0b2540;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.cta-section p {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
  min-width: 150px;
  text-align: center;
}

.cta-btn.primary {
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
  color: white;
}

.cta-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
}

.cta-btn.secondary {
  background: white;
  color: #0d6efd;
  border: 2px solid #0d6efd;
}

.cta-btn.secondary:hover {
  background: #0d6efd;
  color: white;
  transform: translateY(-2px);
}

.cta-btn.admin {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: 2px solid #e74c3c;
}

.cta-btn.admin:hover {
  background: #e74c3c;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
}

.home-right {
  flex: 1;
  background: #e7f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.image-container {
  text-align: center;
}

.home-image {
  max-width: 100%;
  height: auto;
  max-height: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .home-wrapper {
    flex-direction: column;
    margin: 1rem;
  }

  .home-left {
    padding: 2rem;
  }

  .home-right {
    padding: 1rem;
  }

  .home-title {
    font-size: 2.5rem;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-btn {
    width: 100%;
    max-width: 250px;
  }
}
</style>