import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { AppContext } from "../types";

export class UserApplicationDataDelete extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Delete user application data",
		request: {
			params: z.object({
				userId: Str({ description: "The unique user ID" }),
			}),
		},
		responses: {
			"200": {
				description: "Data deleted successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { userId } = data.params;

		await c.env.USER_DATA_KV.delete(userId);

		return {
			success: true,
		};
	}
}
