##### DEPENDENCIES

FROM --platform=linux/amd64 node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml\* ./

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### BUILDER

FROM --platform=linux/amd64 node:20-alpine AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
WORKDIR /app

RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1

# Set mock environment variables for build
ENV KINDE_CLIENT_ID touriapp-sample
ENV KINDE_CLIENT_SECRET touriapp-sample-secret
ENV KINDE_ISSUER_URL https://yourapp.kinde.com
ENV KINDE_SITE_URL http://yourapp.com
ENV KINDE_POST_LOGOUT_REDIRECT_URL http://yourapp.com

ARG NEXT_PUBLIC_MAPS_API_KEY
ARG NEXT_PUBLIC_MAPS_ID
ARG NEXT_PUBLIC_TOURI_LIVE_ENDPOINT

ENV NEXT_PUBLIC_MAPS_API_KEY=$NEXT_PUBLIC_MAPS_API_KEY
ENV NEXT_PUBLIC_MAPS_ID=$NEXT_PUBLIC_MAPS_ID
ENV NEXT_PUBLIC_TOURI_LIVE_ENDPOINT=$NEXT_PUBLIC_TOURI_LIVE_ENDPOINT

RUN \
    if [ -f yarn.lock ]; then yarn build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### RUNNER

FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["server.js"]