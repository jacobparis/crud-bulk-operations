import { parseWithZod } from '@conform-to/zod'
import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
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

	const project = 'EIT'
	const number = await prisma.issue.count()
	await prisma.issue.create({
		data: {
			project,
			number,
			title: submission.value.title,
			description: '',
			status: 'todo',
			priority: 'medium',
		},
	})

	return redirectWithToast('/issues', {
		description: `Created issue ${project}-${number}`,
		type: 'success',
	})
}

export async function loader({ request }: LoaderFunctionArgs) {
	const issues = await prisma.issue.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		select: {
			id: true,
			project: true,
			number: true,
			title: true,
			status: true,
		},
	})

	return json({
		issues,
	})
}

export default function Issues() {
	const { issues } = useLoaderData<typeof loader>()

	return (
		<div className="mx-auto max-w-4xl p-4">
			<div className="grid grid-cols-[min-content_1fr_min-content] text-sm">
				{issues.map(issue => (
					<div key={issue.id} className="col-span-3 grid grid-cols-subgrid">
						<div className="p-2 align-middle"> {issue.number} </div>
						<div className="p-2 align-middle font-medium">{issue.title}</div>
						<div className="p-2 align-middle">{issue.status}</div>
					</div>
				))}
			</div>

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
