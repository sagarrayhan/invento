import { useState } from "react"

const [loading, setLoading] = useState(false)
const [preview, setPreview] = useState<string | null>(null)

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "")

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/dj4jjjefd/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    )

    const data = await res.json()
    setLoading(false)
}