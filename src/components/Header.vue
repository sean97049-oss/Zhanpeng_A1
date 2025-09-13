<template>
  <header class="site-header">
    <div class="container">
      <ul class="nav nav-pills justify-content-center py-0">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active" aria-current="page">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">About</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/scoreSystem" class="nav-link" active-class="active">Score </router-link>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88px;
  background: #fff;
  display: flex;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}


.nav {
  margin: 0;
}
</style>