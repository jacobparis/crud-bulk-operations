import { parseWithZod } from '@conform-to/zod'
import { type ActionFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { z } from 'zod'
import { Field } from '#app/components/forms.js'
import { Button } from '#app/components/ui/button.js'
import { prisma } from '#app/utils/db.server.js'
import { redirectWithToast } from '#app/utils/toast.server.js'

const CreateIssueInlineSchema = z.object({
	title: z.string().min(1),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: CreateIssueInlineSchema,
	})

	if (submission.status !== 'success') {
		throw new Error('Title is required')
	}

	// await prisma.issue.create({
	// 	data: {
	// 		🐨 Add the new issue data here
	// 	},
	// })

	return redirectWithToast('/issues', {
		// 🐨 Return the project and number like `Created issue EIT-123`
		description: `Created issue ${submission.value.title}`,
		type: 'success',
	})
}

export default function Issues() {
	return (
		<div className="mx-auto max-w-4xl p-4">
			<div>
				<Form method="POST">
					<Field
						labelProps={{ children: 'New issue' }}
						inputProps={{
							type: 'text',
							name: 'title',
							required: true,
						}}
					/>

					<Button type="submit">Submit</Button>
				</Form>
			</div>
		</div>
	)
}
