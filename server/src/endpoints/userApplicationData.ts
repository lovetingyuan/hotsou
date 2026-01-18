import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { AppContext, UserData } from "../types";

export class UserApplicationData extends OpenAPIRoute {
	schema = {
		tags: ["Users"],
		summary: "Get user application data",
		request: {
			params: z.object({
				userId: Str({ description: "The unique user ID" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns the user application data",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							result: UserData,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		console.log("UserApplicationData endpoint hit");
		const data = await this.getValidatedData<typeof this.schema>();
		const { userId } = data.params;
		console.log("Fetching data for userId:", userId);

		const dataResult = await c.env.USER_DATA_KV.get(userId, { type: "json" });
		
		return {
			success: true,
			result: dataResult || {},
		};
	}
}
