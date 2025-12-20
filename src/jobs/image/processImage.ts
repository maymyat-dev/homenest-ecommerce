export async function processImage(data: {
  imageId: string;
  imageUrl: string;
}) {
  const { imageId, imageUrl } = data;

  console.log("Processing image", imageId);

}