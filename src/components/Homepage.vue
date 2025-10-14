<template>
  <div class="container mt-5" style="max-width:560px">
    <h2 class="mb-3">Welcome</h2>

    <div class="card p-4">
      <p class="text-muted mb-3">Please log in or register for a better experience.</p>
      <div class="d-flex gap-2">
        <router-link class="btn btn-primary" to="/login">Login</router-link>
        <router-link class="btn btn-outline-secondary" to="/register">Register</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>