FROM mhart/alpine-node

# Set the default working directory
WORKDIR /usr/src

# Copy the relevant files to the working directory.
COPY . .
RUN npm i

# Build and export the app.
RUN npm run build && mv build/ /public