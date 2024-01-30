"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto"

const region = process.env.AWS_BUCKET_REGION ?? "";
const accessKeyId = process.env.AWS_ACCESS_KEYID ?? "";
const secretAccessKey = process.env.AWS_SECRET_KEYID ?? "";
// const bucket = process.env.AWS_BUCKET_NAME! ?? "";
const s3Client = new S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
})
console.log('kainat')

const acceptedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",


]
export async function getSignedURL(type: string, checksum: string, fileName: string){
    const session = await getServerSession(authOptions)
    if(!session){
        return {failure: "Not authenticated"}
    }
    if(!acceptedTypes.includes(type)){
        return {failure: "invalid file type"}
    }
   

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileName,
        ContentType: type,
        ChecksumSHA256: checksum,
        Metadata:{
            userId: session.user.id,

        } 
      })
    const url = await getSignedUrl(
        s3Client,
        putObjectCommand,
        { expiresIn: 60 } // 60 seconds
      )
   
    return {success: {url}}
}