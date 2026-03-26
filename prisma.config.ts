import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "test/integration/assets/schema/schema.prisma",
  datasource: {
    url: "file:./test.db",
  },
});
